import { NextResponse } from 'next/server';
import { VENUES_REST_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    const { city_id } = await request.json();

    if (!city_id) {
      return NextResponse.json({ error: "City ID is required" }, { status: 400 });
    }

    const apiUrl = VENUES_REST_API.BASE;
    console.log(`📡 Fetching venues by city ${city_id} from all venues: ${apiUrl}`);

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

    const allVenues = await response.json();
    const cityVenues = Array.isArray(allVenues)
      ? allVenues.filter((v: any) => Number(v.city_id) === Number(city_id))
      : [];

    return NextResponse.json(cityVenues, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Error fetching venues by city:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch venues by city" },
      { status: 500 }
    );
  }
}
