import { NextResponse } from 'next/server';
import { VENUES_REST_API } from '@/config/api';

// Force dynamic to allow no-store fetches to backend during runtime
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const apiUrl = VENUES_REST_API.BASE;
    console.log(`📡 Fetching all venues with city from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // The new API already includes city_name and city_id
    // We'll normalize it to ensure compatibility with existing frontend maps
    const normalizedData = Array.isArray(data) ? data.map((v: any) => ({
      ...v,
      venue_id: v.id,
      venue_name: v.venue_name,
      venue_is_active: v.is_active === 1 || v.is_active === true,
      venue_created_at: v.created_at,
      venue_updated_at: v.updated_at,
      event_count: v.event_count || 0
    })) : [];

    return NextResponse.json(normalizedData, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Error fetching venues with city:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch venues with city" },
      { status: 500 }
    );
  }
}
