import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/city/get-all";

    let response;
    try {
      // Make the request to the external API
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      
      // Get the response as text first to handle potential non-JSON responses
      const responseText = await response.text();
      
      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        console.error('Server API route: Received HTML response instead of JSON');
        throw new Error('Received HTML response from the server. The API might be down or misconfigured.');
      }

      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        const parseError = error as Error;
        console.error('Server API route: Failed to parse JSON response:', parseError);
        throw new Error(`Failed to parse API response: ${parseError.message}`);
      }

      // If we get here, the response was successfully parsed as JSON
      if (!response.ok) {
        console.error('Server API route: API returned error status with response:', data);
        return NextResponse.json(
          { 
            error: data.message || `API returned error status: ${response.status}`,
            status: response.status,
            data: data
          },
          { status: response.status }
        );
      }

      // Ensure we have an array
      if (!Array.isArray(data)) {
        console.warn("Server API route: API did not return an array:", data);
        return NextResponse.json(
          { 
            error: "Invalid response format: expected an array of cities",
            received: typeof data,
            data: data
          },
          { status: 200 } // Still return 200 but with error in the response
        );
      }

      return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
      console.error("Server API route: Error in fetch request:", error);
      
      // If we have a response object, include its status in the error
      const status = response?.status || 500;
      const statusText = response?.statusText || 'Internal Server Error';
      
      return NextResponse.json(
        { 
          error: error.message || `Failed to fetch cities: ${status} ${statusText}`,
          status: status,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: status }
      );
    }
  } catch (error: any) {
    console.error("Server API route: Unexpected error:", error);
    return NextResponse.json(
      { 
        error: error.message || "An unexpected error occurred",
        status: 500,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
