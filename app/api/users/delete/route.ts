import { NextResponse } from 'next/server';
import { USER_API } from '@/config/api';

export async function POST(request: Request) {
  try {


    // Parse the request body
    const data = await request.json();


    // Ensure user_id is a number
    const userId = Number(data.user_id);


    if (!userId || isNaN(userId) || userId <= 0) {
      console.error(`Server API route: Invalid user ID: ${userId}`);
      return NextResponse.json(
        { error: "Invalid user ID. ID must be a positive number." },
        { status: 400 }
      );
    }



    // Forward the request to the external API with the correct URL
    const apiUrl = USER_API.DELETE;


    // Create a request body with the numeric ID
    const requestBody = { user_id: userId };


    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });



    // Get the response data
    const responseText = await response.text();


    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);


      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails but we got a 200 status, consider it a success
      if (response.status >= 200 && response.status < 300) {

        return NextResponse.json({ success: true }, { status: 200 });
      }

      // If the response is empty but status is OK, consider it a success
      if (responseText.trim() === '' && response.status >= 200 && response.status < 300) {

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
