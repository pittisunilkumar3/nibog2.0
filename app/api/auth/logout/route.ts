import { NextResponse } from 'next/server';

export async function POST() {
  // Create response that will clear the cookies
  const response = NextResponse.json({ success: true });

  // Clear the user session cookie
  response.cookies.set('nibog-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // This will cause the cookie to be deleted
  });

  // Clear the user-token cookie (for backward compatibility)
  response.cookies.set('user-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // Clear the superadmin token cookie
  response.cookies.set('superadmin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
