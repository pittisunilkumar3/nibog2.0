import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const userData = await request.json();

    console.log("Server API route: Registering user request");

    // Validate required fields
    if (!userData.full_name) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!userData.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!userData.phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!userData.password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Backend URL from environment variable
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL is not defined in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Prepare payload for backend
    // Backend expects: full_name, email, password, phone, city_id (optional)
    const backendPayload = {
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      city_id: userData.city_id || null // Ensure city_id is null if not provided
    };

    // Forward the request to the external API
    const apiUrl = `${backendUrl}/api/user/register`;
    console.log("Server API route: Calling API URL:", apiUrl);
    // console.log("Payload:", JSON.stringify(backendPayload, null, 2)); // Careful with logging passwords

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
      cache: "no-store",
    });

    console.log(`Server API route: Register user response status: ${response.status}`);

    // Parse the response
    const responseData = await response.json();

    // Handle API error
    if (!response.ok || !responseData.success) {
      console.error(`Register failed: ${JSON.stringify(responseData)}`);
      return NextResponse.json(
        { error: responseData.message || "Registration failed" },
        { status: response.status || 400 }
      );
    }

    // Return the successful response
    // Frontend expects { success: true, ... }
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Server API route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
