'use server';

import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function checkServerSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    return !!sessionCookie?.value;
  } catch (error) {
    console.error('Error checking server session:', error);
    return false;
  }
}
