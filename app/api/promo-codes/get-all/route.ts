import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
export async function GET() {
  try {

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/promocode/get-all";

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`Server API route: Get all promo codes response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server API route: Error response: ${errorText}`);

        // Check if this is a "webhook not registered" error (404)
        if (response.status === 404 && errorText.includes("webhook") && errorText.includes("not registered")) {

          // Return empty array when webhook doesn't exist
          // This allows the frontend to work while the API endpoint is being set up
          return NextResponse.json([], {
            status: 200,
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              'X-Fallback': 'true', // Indicate this is fallback data
            }
          });
        }

        // If the first attempt fails with other errors, try with webhook-test URL

        const alternativeUrl = apiUrl.replace("webhook/v1", "webhook-test/v1");

        const alternativeResponse = await fetch(alternativeUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!alternativeResponse.ok) {
          const altErrorText = await alternativeResponse.text();
          console.error(`Server API route: Alternative URL also failed: ${altErrorText}`);

          // If alternative URL also fails with webhook not registered, return empty array
          if (alternativeResponse.status === 404 && altErrorText.includes("webhook") && altErrorText.includes("not registered")) {
            console.log("Server API route: Alternative webhook also not registered - returning empty array");
            return NextResponse.json([], {
              status: 200,
              headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Fallback': 'true',
              }
            });
          }

          throw new Error(`Both API URLs failed. Status: ${alternativeResponse.status}`);
        }

        const alternativeData = await alternativeResponse.json();

        return NextResponse.json(alternativeData, {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      }

      const data = await response.json();

      return NextResponse.json(data, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error("Server API route: Request timeout");
        return NextResponse.json(
          { error: "Request timeout. Please try again." },
          { status: 408 }
        );
      }
      
      console.error("Server API route: Fetch error:", fetchError);
      throw fetchError;
    }

  } catch (error: any) {
    console.error("Server API route: Error fetching promo codes:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch promo codes",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
