import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('superadmin-token')?.value;
  if (!token) return NextResponse.json({ error: 'Please sign in as an administrator.' }, { status: 401 });
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || new URL(origin).host !== host) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  if (!/^[1-9][0-9]*$/.test(params.id)) return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3004'}/api/bookings/${params.id}/resend-email`, {
      method: 'POST', headers: { 'x-superadmin-token': token }, cache: 'no-store'
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Unable to confirm email delivery. Please check before trying again.' }, { status: 502 });
  }
}
