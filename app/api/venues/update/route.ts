import { NextResponse } from 'next/server';
import { VENUES_REST_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const authHeader = request.headers.get('Authorization');
    const id = data.id || data.venue_id;

    if (!id) {
      return NextResponse.json({ error: "Venue ID is required for update" }, { status: 400 });
    }

    const apiUrl = `${VENUES_REST_API.BASE}/${id}`;
    console.log(`📡 Updating venue ${id} at: ${apiUrl}`);
    console.log(`🔑 Auth header received: ${authHeader ? 'Present (' + authHeader.substring(0, 15) + '...)' : 'Missing'}`);

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify(data),
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

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Error updating venue:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to update venue" },
      { status: 500 }
    );
  }
}
