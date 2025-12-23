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
        email: employee.employee_email || employee.email,
        name: employee.name,
        is_superadmin: employee.is_superadmin,
        token: token, // Include the token in the cookie for client-side access
      };

      res.cookies.set('superadmin-token', JSON.stringify(sessionData), {
        httpOnly: false, // Allow client access for authentication
        secure: false,  // Don't set secure flag to work with both HTTP and HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Also set the auth token separately for API calls
      res.cookies.set('auth-token', token, {
        httpOnly: false,
        secure: false,  // Don't set secure flag to work with both HTTP and HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
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


