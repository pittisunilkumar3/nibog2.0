import { NextResponse } from 'next/server';
import { BABY_GAMES_REST_API } from '@/config/api';

export async function GET() {
  try {
    const apiUrl = BABY_GAMES_REST_API.BASE;
    console.log(`📡 Fetching all baby games from: ${apiUrl}`);

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

    // The new API returns { success: true, games: [...] }
    let games = data.success && Array.isArray(data.games) ? data.games : (Array.isArray(data) ? data : []);

    // Parse categories for each game
    games = games.map((game: any) => ({
      ...game,
      categories: typeof game.categories === 'string' ? (() => {
        try { return JSON.parse(game.categories); } catch (e) { return []; }
      })() : (game.categories || [])
    }));

    return NextResponse.json(games, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Error fetching baby games:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch baby games" },
      { status: 500 }
    );
  }
}
