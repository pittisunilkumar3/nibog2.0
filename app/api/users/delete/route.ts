import { NextResponse } from 'next/server';
import { USER_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting delete user request");

    // Parse the request body
    const data = await request.json();
    console.log(`Server API route: Received request body: ${JSON.stringify(data)}`);

    // Ensure user_id is a number
    const userId = Number(data.user_id);
    console.log(`Server API route: Extracted user_id: ${userId}, type: ${typeof userId}`);

    if (!userId || isNaN(userId) || userId <= 0) {
      console.error(`Server API route: Invalid user ID: ${userId}`);
      return NextResponse.json(
        { error: "Invalid user ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    console.log(`Server API route: Attempting to delete user with ID: ${userId}`);

    // Forward the request to the external API with the correct URL
    const apiUrl = USER_API.DELETE;
    console.log("Server API route: Calling API URL:", apiUrl);
    console.log(`Server API route: Request body: ${JSON.stringify({ user_id: userId })}`);
    console.log(`Server API route: Request method: POST`);

    // Create a request body with the numeric ID
    const requestBody = { user_id: userId };
    console.log(`Server API route: Final request body: ${JSON.stringify(requestBody)}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    console.log(`Server API route: Delete user response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Delete user response:", responseData);

      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails but we got a 200 status, consider it a success
      if (response.status >= 200 && response.status < 300) {
        console.log("Server API route: Response is not valid JSON but status is OK, considering it a success");
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // If the response is empty but status is OK, consider it a success
      if (responseText.trim() === '' && response.status >= 200 && response.status < 300) {
        console.log("Server API route: Response is empty but status is OK, considering it a success");
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
    console.error("Server API route: Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
