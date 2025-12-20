import { NextResponse } from 'next/server';
import { BABY_GAMES_REST_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const id = data.id;

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid game ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    const apiUrl = `${BABY_GAMES_REST_API.BASE}/${id}`;
    console.log(`📡 Fetching baby game ${id} from: ${apiUrl}`);

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

    const responseData = await response.json();

    // The new API returns { success: true, game: { ... } }
    let game = responseData.success && responseData.game ? responseData.game : responseData;

    if (game && typeof game.categories === 'string') {
      try {
        game.categories = JSON.parse(game.categories);
      } catch (e) {
        game.categories = [];
      }
    }

    return NextResponse.json(game, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Error fetching baby game:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch baby game" },
      { status: 500 }
    );
  }
}
