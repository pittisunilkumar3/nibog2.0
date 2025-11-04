import { NextResponse } from 'next/server';
import { USER_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting edit user request");

    // Parse the request body
    const userData = await request.json();
    console.log(`Server API route: Received request body: ${JSON.stringify(userData)}`);

    // Ensure user_id is a number
    const userId = Number(userData.user_id);
    console.log(`Server API route: Extracted user_id: ${userId}, type: ${typeof userId}`);

    if (!userId || isNaN(userId) || userId <= 0) {
      console.error(`Server API route: Invalid user ID: ${userId}`);
      return NextResponse.json(
        { error: "Invalid user ID. ID must be a positive number." },
        { status: 400 }
      );
    }

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

    // Validate city_id if provided and not null
    if (userData.city_id !== undefined && userData.city_id !== null) {
      if (isNaN(Number(userData.city_id))) {
        return NextResponse.json(
          { error: "City ID must be a number if provided" },
          { status: 400 }
        );
      }
      // Convert to number if it's a string
      userData.city_id = Number(userData.city_id);
    }

    console.log(`Server API route: Attempting to edit user with ID: ${userId}`);

    // Forward the request to the external API with the correct URL
    const apiUrl = USER_API.UPDATE;
    console.log("Server API route: Calling API URL:", apiUrl);
    console.log(`Server API route: Request method: POST`);

    // Ensure city_id is a number when provided, otherwise keep it null
    const normalizedUserData = {
      ...userData,
      user_id: userId,
      // Preserve null/undefined, only convert to number if provided
      city_id: userData.city_id !== null && userData.city_id !== undefined ? Number(userData.city_id) : null,
      accept_terms: Boolean(userData.accept_terms)
    };
    
    console.log("Server API route: city_id type:", typeof normalizedUserData.city_id, "value:", normalizedUserData.city_id);

    // Ensure boolean fields are properly set
    if (userData.is_active !== undefined) {
      normalizedUserData.is_active = Boolean(userData.is_active);
    }

    if (userData.is_locked !== undefined) {
      normalizedUserData.is_locked = Boolean(userData.is_locked);
    }

    console.log(`Server API route: Final request body: ${JSON.stringify(normalizedUserData)}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedUserData),
      cache: "no-store",
    });

    console.log(`Server API route: Edit user response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Edit user response:", responseData);

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
    console.error("Server API route: Error editing user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to edit user" },
      { status: 500 }
    );
  }
}
