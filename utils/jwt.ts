import jwt from 'jsonwebtoken';

// In a production environment, this should be loaded from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'nibog-jwt-secret-key';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days in seconds

export interface JwtPayload {
  user_id: number;
  email: string;
  full_name: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for the authenticated user
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};
