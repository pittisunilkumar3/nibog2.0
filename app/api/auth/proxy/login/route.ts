import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate request
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Backend URL from environment variable
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL is not defined in environment variables");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const apiUrl = `${backendUrl}/api/employee/login`;
    console.log("Super Admin Proxy: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Login failed' },
        { status: response.status || 401 }
      );
    }

    // Prepare success response
    const { token, employee } = data;

    // Check if user is actually a superadmin
    if (employee.is_superadmin !== 1) {
      return NextResponse.json(
        { success: false, message: 'Access denied: Not a superadmin' },
        { status: 403 }
      );
    }

    // Create response with the data
    const res = NextResponse.json({
      success: true,
      token,
      employee
    }, { status: 200 });

    // Set session cookie
    if (token && employee) {
      // Store minimal session data in the cookie
      const sessionData = {
        id: employee.id,
        email: employee.employee_email || employee.email, // backend sends 'email' in example, checking both just in case
        name: employee.name,
        is_superadmin: employee.is_superadmin,
      };

      res.cookies.set('superadmin-token', JSON.stringify(sessionData), {
        httpOnly: false, // Allow client access for simple checks if needed, or keep true for security. Plan said cookie logic maintained.
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Also setting the token itself might be useful if the frontend uses it for API calls
      // But the previous implementation stored the whole object in 'superadmin-token'.
      // We will stick to that pattern for compatibility, but strictly it should be just the token.
      // However, the previous code on line 38 of route.ts was:
      // res.cookies.set('superadmin-token', JSON.stringify(sessionData)...
      // So we are consistent.
    }

    return res;
  } catch (error) {
    console.error('Proxy login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}


