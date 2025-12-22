import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // removed debug log

    // Parse the request body to get the ID
    const requestData = await request.json();
    const promoCodeId = requestData.id;

    if (!promoCodeId) {
      return NextResponse.json(
        { error: "Promo code ID is required" },
        { status: 400 }
      );
    }

    // removed debug log

    // Forward the request to the external API
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/promocode/get";
    // removed debug log

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: parseInt(promoCodeId) }),
        cache: "no-store",
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      // removed debug log

      if (!response.ok) {
        // If the first attempt fails, try with webhook-test URL
        // removed debug log
        
        const alternativeUrl = apiUrl.replace("webhook/v1", "webhook-test/v1");
        // removed debug log
        
        const alternativeResponse = await fetch(alternativeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: parseInt(promoCodeId) }),
          cache: "no-store",
        });

        // removed debug log

        if (!alternativeResponse.ok) {
          const altErrorText = await alternativeResponse.text();
          console.error(`Server API route: Alternative URL also failed: ${altErrorText}`);
          
          // If alternative URL also fails with webhook not registered, return 404
          if (alternativeResponse.status === 404 && altErrorText.includes("webhook") && altErrorText.includes("not registered")) {
            // removed debug log
            return NextResponse.json(
              { error: "Promo code not found" },
              { status: 404 }
            );
          }
          
          throw new Error(`Both API URLs failed. Status: ${alternativeResponse.status}`);
        }

        const alternativeData = await alternativeResponse.json();
        // removed debug log
        
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
      // removed debug log

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
    console.error("Server API route: Error fetching promo code:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch promo code",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
