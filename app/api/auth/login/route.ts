import { NextResponse } from 'next/server';
import { AUTH_API } from '@/config/api';
import { generateToken } from '@/utils/jwt';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const loginData = await request.json();

    console.log("Server API route: User login attempt");

    // Validate required fields
    if (!loginData.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!loginData.password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Ensure device_info is present
    if (!loginData.device_info) {
      // Create a basic device_info object if not provided
      loginData.device_info = {
        device_id: "web-client",
        os: "Unknown",
        os_version: "Unknown",
        browser: "Unknown",
        ip_address: "0.0.0.0"
      };
    }

    // Forward the request to the external API
    const apiUrl = AUTH_API.USER.LOGIN;
    console.log("Server API route: Calling API URL:", apiUrl);
    console.log("Server API route: Sending payload:", {
      email: loginData.email,
      password: "[REDACTED]",
      device_info: loginData.device_info,
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password,
        device_info: loginData.device_info,
      }),
      cache: "no-store",
    });

    console.log(`Server API route: Login response status: ${response.status}`);

    // Handle API response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      return NextResponse.json(
        { error: `Login failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Parse the response
    const responseData = await response.json();
    console.log('Server API route: Response data:', JSON.stringify(responseData));
    
    // Check if we got the expected response structure - empty array means login failed
    if (!responseData || !Array.isArray(responseData) || responseData.length === 0) {
      console.log("Login failed: Empty array response");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("Response structure:", JSON.stringify(responseData[0]));
    
    // Get the user data from the response - format is [{ object: { user data } }]
    if (!responseData[0].object) {
      console.error("Unexpected API response format - missing object property:", responseData);
      return NextResponse.json(
        { error: "Unexpected response format from server" },
        { status: 500 }
      );
    }
    
    const userData = responseData[0].object;

    // Check if user is active
    if (!userData.is_active) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    // Check if user is locked
    if (userData.is_locked) {
      const lockedUntil = userData.locked_until ? new Date(userData.locked_until) : null;
      if (lockedUntil && lockedUntil > new Date()) {
        return NextResponse.json(
          { error: `Account is locked until ${lockedUntil.toLocaleString()}` },
          { status: 401 }
        );
      }
    }

    // Create JWT token
    console.log("Creating JWT token with user data:", {
      user_id: userData.user_id,
      email: userData.email,
      full_name: userData.full_name
    });
    
    const token = generateToken({
      user_id: userData.user_id,
      email: userData.email,
      full_name: userData.full_name
    });

    // Create response
    const res = NextResponse.json({
      success: true,
      data: userData,
      token
    });

    // Set authorization header
    res.headers.set('authorization', `Bearer ${token}`);

    // Set the session cookie with the correct name that middleware expects
    // Using httpOnly: false to allow client-side JavaScript to access it
    // This is needed for the auth context to work properly
    res.cookies.set('nibog-session', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7  // 7 days
    });

    // Also set user-token for backward compatibility
    res.cookies.set('user-token', JSON.stringify({
      user_id: userData.user_id,
      email: userData.email,
      full_name: userData.full_name,
      city_id: userData.city_id,
      is_active: userData.is_active,
      is_superadmin: false
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7  // 7 days
    });

    return res;
  } catch (error) {
    console.error("Server API route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
