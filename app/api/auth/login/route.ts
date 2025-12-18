import { NextResponse } from 'next/server';

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

    // Backend URL from environment variable
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL is not defined in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const apiUrl = `${backendUrl}/api/user/login`;
    console.log("Server API route: Calling API URL:", apiUrl);

    // Forward the request to the external API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password
      }),
      cache: "no-store",
    });

    console.log(`Server API route: Login response status: ${response.status}`);

    // Parse the response
    const responseData = await response.json();
    console.log('Server API route: Response data:', JSON.stringify(responseData));

    // Handle API error response
    if (!response.ok || !responseData.success) {
      return NextResponse.json(
        { error: responseData.message || "Invalid credentials." },
        { status: response.status || 401 }
      );
    }

    // Extract user and token from success response
    const { token, user } = responseData;

    if (!token || !user) {
      console.error("Missing token or user in response");
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 }
      );
    }

    // Check if user is active/locked (although backend likely checks this, good to have double check if data is available)
    if (user.is_active === 0) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    if (user.is_locked === 1) {
       return NextResponse.json(
        { error: "Account is locked" },
        { status: 401 }
      );
    }

    // Create response wrapped in the format the frontend expects
    // The frontend expects { success: true, data: user, token: token }
    const res = NextResponse.json({
      success: true,
      data: user,
      token
    });

    // Set cookies
    res.headers.set('authorization', `Bearer ${token}`);

    // Set the session cookie
    res.cookies.set('nibog-session', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7  // 7 days
    });

    // Set user-token for backward compatibility
    res.cookies.set('user-token', JSON.stringify({
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      city_id: user.city_id,
      is_active: user.is_active,
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
