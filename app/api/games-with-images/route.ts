import { NextRequest, NextResponse } from 'next/server';
import { BABY_GAMES_REST_API } from '@/config/api';

// Configure route segment to allow dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const apiUrl = BABY_GAMES_REST_API.BASE;

    const response = await fetch(apiUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch games from backend', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const gamesData = data.success && Array.isArray(data.games) ? data.games : (Array.isArray(data) ? data : []);

    // Filter only active games with images
    const activeGamesWithImages = gamesData.filter((game: any) =>
      game &&
      (game.is_active === true || game.is_active === 1) &&
      game.image_url
    );

    // Take the first 4 games
    const firstFourGames = activeGamesWithImages.slice(0, 4);

    // Transform the data for frontend use
    const transformedGames = firstFourGames.map((game: any) => {
      let imageUrl = game.image_url;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = `/api/serve-image/${imageUrl}`;
      }

      return {
        id: game.id,
        name: game.game_name,
        description: game.description,
        minAge: game.min_age,
        maxAge: game.max_age,
        duration: game.duration_minutes || 10,
        categories: typeof game.categories === 'string' ? (() => {
          try { return JSON.parse(game.categories); } catch (e) { return []; }
        })() : (game.categories || []),
        imageUrl: imageUrl,
        imagePriority: game.priority || 0,
        isActive: game.is_active === true || game.is_active === 1,
        createdAt: game.created_at,
        updatedAt: game.updated_at
      };
    });

    return NextResponse.json(transformedGames, { status: 200 });

  } catch (error) {
    console.error('❌ Games with images API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
