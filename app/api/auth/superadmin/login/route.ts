import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

// Define JWT payload interface
interface JwtPayload {
  email: string;
  role: string;
}

// This would typically come from your database
const SUPERADMIN_CREDENTIALS = {
  email: process.env.SUPERADMIN_EMAIL || 'superadmin@example.com',
  // In a real app, store hashed password in env vars or database
  passwordHash: process.env.SUPERADMIN_PASSWORD_HASH || 
    '$2a$10$XFDq3wLx5kz3Q5X5b5v5UeQY5v5X5b5v5UeQY5v5X5b5v5UeQY5v5X5b5v5U' // hash of 'superadmin123'
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check credentials
    if (email !== SUPERADMIN_CREDENTIALS.email) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password (in a real app, compare with hashed password from database)
    const isPasswordValid = await compare(password, SUPERADMIN_CREDENTIALS.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = sign(
      { email, role: 'superadmin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Create response with success message
    const response = NextResponse.json(
      { message: 'Login successful', user: { email, role: 'superadmin' } },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'superadmin-token',
      value: token,
      httpOnly: true,
      secure: false,  // Don't set secure flag to work with both HTTP and HTTPS
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error) {
    console.error('Superadmin login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
