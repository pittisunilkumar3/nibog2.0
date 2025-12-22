import { NextResponse } from 'next/server';
import { VENUES_REST_API } from '@/config/api';

// Force dynamic to allow no-store fetches to backend during runtime
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const apiUrl = VENUES_REST_API.BASE;


    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API error status: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Error fetching venues:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch venues" },
      { status: 500 }
    );
  }
}
