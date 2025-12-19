import { NextResponse } from 'next/server';
import { BABY_GAMES_REST_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const authHeader = request.headers.get('Authorization');
    const id = data.id;

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid game ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    const apiUrl = `${BABY_GAMES_REST_API.BASE}/${id}`;
    console.log(`📡 Deleting baby game ${id} at: ${apiUrl}`);
    console.log(`🔑 Auth header received: ${authHeader ? 'Present (' + authHeader.substring(0, 15) + '...)' : 'Missing'}`);

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { 'Authorization': authHeader } : {}),
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

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Error deleting baby game:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to delete baby game" },
      { status: 500 }
    );
  }
}
