import { NextResponse } from 'next/server';
import { AUTH_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const response = await fetch(AUTH_API.SUPERADMIN.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: error.message || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Create response with the data
    const res = NextResponse.json(data, { status: 200 });

    // If login successful, create a session cookie with user data
    if (data[0]?.success && data[0]?.object) {
      const sessionData = {
        id: data[0].object.id,
        email: data[0].object.email,
        is_superadmin: data[0].object.is_superadmin,
      };

      // Set session cookie
      res.cookies.set('superadmin-token', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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


