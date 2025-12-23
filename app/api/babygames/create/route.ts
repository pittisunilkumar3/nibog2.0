import { NextResponse } from 'next/server';
import { BABY_GAMES_REST_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const authHeader = request.headers.get('Authorization');

    if (!data.game_name) {
      return NextResponse.json({ error: "Game name is required" }, { status: 400 });
    }

    const apiUrl = BABY_GAMES_REST_API.BASE;
   
    const response = await fetch(apiUrl, {
      method: "POST",
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
    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error(`❌ Error creating baby game:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to create baby game" },
      { status: 500 }
    );
  }
}
