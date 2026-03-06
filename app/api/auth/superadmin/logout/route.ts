import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a response with success message
    const response = NextResponse.json(
      { message: 'Logout successful', success: true },
      { status: 200 }
    );

    // Clear the superadmin token cookie - must match the same settings used when setting the cookie
    response.cookies.set({
      name: 'superadmin-token',
      value: '',
      httpOnly: false,  // Must match the login setting
      secure: false,    // Must match the login setting
      sameSite: 'lax',  // Must match the login setting
      path: '/',
      maxAge: 0 // Expire immediately
    });

    // Also clear the auth-token cookie
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
