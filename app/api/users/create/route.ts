import { NextResponse } from 'next/server';
import { USER_AUTH_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting create user request");

    // Parse the request body
    const userData = await request.json();
    console.log(`Server API route: Received request body: ${JSON.stringify(userData)}`);

    // Validate required fields
    if (!userData.full_name || userData.full_name.trim() === '') {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!userData.email || userData.email.trim() === '') {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!userData.phone || userData.phone.trim() === '') {
      return NextResponse.json(
        { error: "Phone is required" },
        { status: 400 }
      );
    }

    if (!userData.password || userData.password.trim() === '') {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (!userData.city_id || isNaN(Number(userData.city_id))) {
      return NextResponse.json(
        { error: "City ID is required and must be a number" },
        { status: 400 }
      );
    }

    if (userData.accept_terms !== true) {
      return NextResponse.json(
        { error: "You must accept the terms and conditions" },
        { status: 400 }
      );
    }

    console.log(`Server API route: Attempting to create user`);

    // Forward the request to the external API with the correct URL
    const apiUrl = USER_AUTH_API.REGISTER;
    console.log("Server API route: Calling API URL:", apiUrl);
    console.log(`Server API route: Request method: POST`);

    // Ensure city_id is a number
    const normalizedUserData = {
      ...userData,
      city_id: Number(userData.city_id),
      accept_terms: Boolean(userData.accept_terms)
    };

    console.log(`Server API route: Final request body: ${JSON.stringify(normalizedUserData)}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedUserData),
      cache: "no-store",
    });

    console.log(`Server API route: Create user response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Create user response:", responseData);

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
    console.error("Server API route: Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
