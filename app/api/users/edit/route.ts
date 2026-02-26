import { NextResponse } from 'next/server';
import { USER_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Parse the request body
    const userData = await request.json();

    // Ensure user_id is a number
    const userId = Number(userData.user_id);

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
    }

    // Build the API URL with user_id in the path (PUT /api/user/:id)
    const apiUrl = `${USER_API.UPDATE}/${userId}`;

    // Prepare the data to send - exclude user_id from body since it's in the URL
    const dataToSend: Record<string, any> = {
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone,
    };

    // Add optional fields if provided
    if (userData.city_id !== undefined && userData.city_id !== null) {
      dataToSend.city_id = Number(userData.city_id);
    }

    if (userData.accept_terms !== undefined) {
      dataToSend.accept_terms = Boolean(userData.accept_terms);
    }

    if (userData.is_active !== undefined) {
      dataToSend.is_active = Boolean(userData.is_active);
    }

    if (userData.is_locked !== undefined) {
      dataToSend.is_locked = Boolean(userData.is_locked);
    }

    console.log(`Server API route: Updating user ${userId} at ${apiUrl}`);
    console.log('Server API route: Data being sent:', dataToSend);

    // Prepare headers - include Authorization if available
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Use PUT method as required by the backend API
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(dataToSend),
      cache: "no-store",
    });

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Response status: ${response.status}`);
    console.log(`Server API route: Response body:`, responseText);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);

      if (!response.ok) {
        return NextResponse.json(
          { error: responseData.message || responseData.error || "Failed to update user" },
          { status: response.status }
        );
      }

      // Return the updated user data
      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails but we got a 200 status, consider it a success
      if (response.status >= 200 && response.status < 300) {
        return NextResponse.json({ success: true, message: "User updated successfully" }, { status: 200 });
      }
      // Otherwise, return the error
      return NextResponse.json(
        {
          error: "Failed to parse API response",
          rawResponse: responseText.substring(0, 500)
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
