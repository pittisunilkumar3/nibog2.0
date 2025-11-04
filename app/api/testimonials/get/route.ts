import { NextResponse } from 'next/server';

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Maximum number of retry attempts
const MAX_RETRIES = 3;

export async function POST(request: Request) {
  let retries = 0;
  let requestBody;
  
  try {
    // Parse the request body (outside the retry loop to avoid parsing multiple times)
    requestBody = await request.json();
    const { id } = requestBody;
    console.log(`Server API route: Getting testimonial with ID: ${id}`);

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid testimonial ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    // Start retry loop
    while (retries < MAX_RETRIES) {
      try {
        console.log(`Server API route: Getting testimonial (attempt ${retries + 1}/${MAX_RETRIES})`);
        
        // Forward the request to the external API
        const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/testimonials/get";
        console.log("Server API route: Calling API URL:", apiUrl);

        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Cache-Control": "no-cache"
          },
          body: JSON.stringify({ id: Number(id) }),
          cache: "no-store",
          next: { revalidate: 0 },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`Server API route: Get testimonial response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Server API route: Error response: ${errorText}`);
          
          // If we get a server error (5xx), retry
          if (response.status >= 500 && retries < MAX_RETRIES - 1) {
            retries++;
            await delay(1000 * retries); // Exponential backoff
            continue;
          }
          
          let errorMessage = `Error getting testimonial: ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // If we can't parse the error as JSON, use the status code
          }

          return NextResponse.json(
            { error: errorMessage },
            { status: response.status }
          );
        }

        // Get the response data
        const responseText = await response.text();
        
        // Handle empty response case
        if (!responseText || responseText.trim() === '') {
          console.log("Server API route: Empty response received for testimonial");
          return NextResponse.json(
            { error: "No testimonial data found" },
            { status: 404 }
          );
        }
        
        console.log(`Server API route: Raw response size: ${responseText.length} characters`);
        
        let data;
        try {
          // Try to parse the response as JSON
          data = JSON.parse(responseText);
          console.log("Server API route: Parsed response data:", data);
        } catch (error) {
          // TypeScript-safe error handling
          const parseError = error instanceof Error ? error : new Error(String(error));
          console.error("Server API route: Error parsing response:", parseError);
          
          // If we can't parse JSON and haven't exceeded retries, try again
          if (retries < MAX_RETRIES - 1) {
            retries++;
            await delay(1000 * retries); // Exponential backoff
            continue;
          }
          
          return NextResponse.json(
            { 
              error: "Failed to parse API response", 
              details: parseError.message,
              rawResponseSample: responseText.substring(0, 200) // Just include a sample for debug
            },
            { status: 500 }
          );
        }
        
        // Check if we got valid data
        if (!data || (Array.isArray(data) && data.length === 0)) {
          return NextResponse.json(
            { error: "No testimonial found with the specified ID" },
            { status: 404 }
          );
        }
        
        // Return the testimonial data
        return NextResponse.json(data, { status: 200 });

      } catch (error: any) {
        console.error(`Server API route: Error getting testimonial (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        
        // Retry on network errors
        if (retries < MAX_RETRIES - 1 && 
            (error.name === 'AbortError' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND')) {
          retries++;
          await delay(1000 * retries); // Exponential backoff
          continue;
        }
        
        // If we've exhausted retries or it's not a retriable error, throw to be caught by outer try/catch
        throw error;
      }
    }
    
    // If we've exhausted all retries and haven't returned or thrown
    return NextResponse.json(
      { error: "Failed to get testimonial after multiple attempts" },
      { status: 503 }
    );
    
  } catch (error: any) {
    console.error("Server API route: Error getting testimonial:", error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timeout - the testimonials service is taking too long to respond" },
        { status: 504 }
      );
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: "Unable to connect to testimonials service" },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to get testimonial" },
      { status: 500 }
    );
  }
}
