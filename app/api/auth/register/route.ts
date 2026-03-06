import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('[REGISTER] Registration request received');
    
    // Parse the request body
    const userData = await request.json();
    console.log('[REGISTER] Request data:', { ...userData, password: '[REDACTED]' });

    // Validate required fields
    if (!userData.full_name) {
      console.log('[REGISTER] Validation failed: Full name missing');
      return NextResponse.json(
        { success: false, error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!userData.email) {
      console.log('[REGISTER] Validation failed: Email missing');
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!userData.phone) {
      console.log('[REGISTER] Validation failed: Phone missing');
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!userData.password) {
      console.log('[REGISTER] Validation failed: Password missing');
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    // Backend URL from environment variable
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("[REGISTER] BACKEND_URL is not defined in environment variables");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Prepare payload for backend
    const backendPayload = {
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      city_id: userData.city_id || null
    };

    // Forward the request to the external API
    const apiUrl = `${backendUrl}/api/user/register`;
    console.log('[REGISTER] Calling backend API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
      cache: "no-store",
    });

    console.log('[REGISTER] Backend response status:', response.status);

    // Parse the response
    const responseData = await response.json();
    console.log('[REGISTER] Backend response:', responseData);

    // Handle API error
    if (!response.ok || !responseData.success) {
      console.error("[REGISTER] Registration failed:", responseData);
      return NextResponse.json(
        { success: false, error: responseData.message || "Registration failed" },
        { status: response.status || 400 }
      );
    }

    console.log('[REGISTER] Registration successful for:', userData.email);

    // Return the successful response
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("[REGISTER] Server error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
