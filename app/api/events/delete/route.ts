import { NextResponse } from 'next/server';
import { EVENT_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting delete event request");

    // Parse the request body
    const data = await request.json();
    console.log(`Server API route: Received request body: ${JSON.stringify(data)}`);

    // Ensure id is a number
    const id = Number(data.id);
    console.log(`Server API route: Extracted ID: ${id}, type: ${typeof id}`);

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      console.error(`Server API route: Invalid event ID: ${id}`);
      return NextResponse.json(
        { error: "Invalid event ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    console.log(`Server API route: Attempting to delete event with ID: ${id}`);

    // Forward the request to the external API with the correct URL
    const apiUrl = EVENT_API.DELETE;
    console.log("Server API route: Calling API URL:", apiUrl);
    console.log(`Server API route: Request body: ${JSON.stringify({ id })}`);
    console.log(`Server API route: Request method: POST`);

    // Create a request body with the numeric ID
    const requestBody = { id };
    console.log(`Server API route: Final request body: ${JSON.stringify(requestBody)}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    console.log(`Server API route: Delete event response status: ${response.status}`);

    if (!response.ok) {
      // If the first attempt fails, log the error and try with a different URL format
      const errorText = await response.text();
      console.error(`Server API route: First attempt failed with status ${response.status}. Error: ${errorText}`);
      console.log("Server API route: Trying with alternative URL format");

      // Try with webhook-test instead of webhook
      const alternativeUrl = apiUrl.replace("webhook/v1", "webhook-test/v1");
      console.log("Server API route: Trying alternative URL:", alternativeUrl);

      console.log(`Server API route: Trying alternative URL with request body: ${JSON.stringify(requestBody)}`);

      const alternativeResponse = await fetch(alternativeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      });

      console.log(`Server API route: Delete event response status from alternative URL: ${alternativeResponse.status}`);

      if (!alternativeResponse.ok) {
        // If both attempts fail, return an error
        const alternativeErrorText = await alternativeResponse.text();
        console.error(`Server API route: Error response from alternative URL: ${alternativeErrorText}`);

        return NextResponse.json(
          {
            error: `Failed to delete event. API returned status: ${alternativeResponse.status}`,
            details: alternativeErrorText.substring(0, 500) // Limit the size of the error text
          },
          { status: alternativeResponse.status }
        );
      }

      // Get the response data from the alternative URL
      const responseText = await alternativeResponse.text();
      console.log(`Server API route: Raw response from alternative URL: ${responseText}`);

      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(responseText);
        console.log("Server API route: Delete event response:", responseData);

        return NextResponse.json(responseData, { status: 200 });
      } catch (parseError) {
        console.error("Server API route: Error parsing response:", parseError);
        // If parsing fails but we got a 200 status, consider it a success
        if (alternativeResponse.status >= 200 && alternativeResponse.status < 300) {
          return NextResponse.json({ success: true }, { status: 200 });
        }
        // Otherwise, return the error
        return NextResponse.json(
          {
            error: "Failed to parse API response",
            rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
          },
          { status: 500 }
        );
      }
    }

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Delete event response:", responseData);

      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails but we got a 200 status, consider it a success
      if (response.status >= 200 && response.status < 300) {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      // Otherwise, return the error
      return NextResponse.json(
        {
          error: "Failed to parse API response",
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Server API route: Error deleting event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
