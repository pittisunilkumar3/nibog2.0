import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

// Define JWT payload interface
interface JwtPayload {
  email: string;
  role: string;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('superadmin-token')?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Type check the decoded token
    if (typeof decoded === 'string' || !decoded || !('role' in decoded) || !('email' in decoded)) {
      throw new Error('Invalid token payload');
    }

    const payload = decoded as JwtPayload;

    // Verify the role is superadmin
    if (payload.role !== 'superadmin') {
      throw new Error('Insufficient permissions');
    }

    return NextResponse.json({
      user: {
        email: payload.email,
        role: payload.role
      }
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
