import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BOOKING_API } from '@/config/api';

export const dynamic = 'force-dynamic';

const createBookingSchema = z.object({
  user_id: z.number().int().nonnegative().nullable().optional(),
  parent: z.object({
    parent_name: z.string(),
    email: z.string().email(),
    additional_phone: z.string().optional(),
    phone: z.string().optional(),
  }).passthrough(),
  child: z.object({
    full_name: z.string(),
    date_of_birth: z.string(),
    gender: z.string(),
    school_name: z.string().optional(),
  }).passthrough(),
  booking: z.object({
    event_id: z.number().int().positive(),
    booking_ref: z.string().optional(),
    total_amount: z.number().nonnegative().optional(),
    payment_method: z.string(),
    payment_status: z.string(),
  }).passthrough(),
  booking_games: z.array(z.object({
    game_id: z.number().int().positive(),
    slot_id: z.number().int().positive(),
    game_price: z.number().nonnegative(),
  }).passthrough()).min(1),
}).passthrough();

const jsonObjectSchema = z.record(z.unknown());

export async function POST(request: Request) {
  try {
    const parsedRequest = createBookingSchema.safeParse(await request.json().catch(() => null));
    if (!parsedRequest.success) {
      return NextResponse.json({ success: false, error: 'Missing or invalid booking data' }, { status: 400 });
    }

    const superadminToken = request.headers.get('x-superadmin-token');
    const response = await fetch(BOOKING_API.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(superadminToken ? { 'x-superadmin-token': superadminToken } : {}),
      },
      body: JSON.stringify(parsedRequest.data),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    const rawResult: unknown = await response.json().catch(() => null);
    const parsedResult = jsonObjectSchema.safeParse(rawResult);
    if (!response.ok) {
      return NextResponse.json(
        parsedResult.success ? parsedResult.data : { success: false, error: 'Booking creation failed' },
        { status: response.status }
      );
    }
    if (!parsedResult.success) {
      return NextResponse.json({ success: false, error: 'Backend returned an invalid booking response' }, { status: 502 });
    }

    return NextResponse.json({ success: true, ...parsedResult.data }, { status: response.status });
  } catch (error) {
    console.error('[BOOKING] Proxy failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ success: false, error: 'Booking creation is temporarily unavailable' }, { status: 503 });
  }
}
