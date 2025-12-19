import { NextResponse } from 'next/server';
import { BABY_GAMES_REST_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const authHeader = request.headers.get('Authorization');
    const id = data.id;

    if (!id) {
      return NextResponse.json({ error: "Game ID is required for update" }, { status: 400 });
    }

    const apiUrl = `${BABY_GAMES_REST_API.BASE}/${id}`;
    console.log(`📡 Updating baby game ${id} at: ${apiUrl}`);
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
    console.error(`❌ Error updating baby game:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to update baby game" },
      { status: 500 }
    );
  }
}
