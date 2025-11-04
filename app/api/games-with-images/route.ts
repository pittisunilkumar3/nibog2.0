import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🎮 Fetching games with images for homepage...');

    // Call the external API to get games with images with cache-busting
    const cacheBuster = Date.now();
    const apiUrl = `https://ai.nibog.in/webhook/nibog/getting/gamedetailswithimage?_t=${cacheBuster}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      cache: 'no-store', // Disable Next.js caching
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

    console.log(`📊 External API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ External API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch games from external API', details: errorText },
        { status: response.status }
      );
    }

    const gamesData = await response.json();
    console.log(`✅ Fetched ${gamesData.length} games from external API`);

    // Filter only active games with images
    const activeGamesWithImages = gamesData.filter((game: any) => 
      game && 
      game.game_is_active === true &&
      game.image_id &&
      game.image_url &&
      game.image_is_active === true
    );

    console.log(`📊 Active games with images: ${activeGamesWithImages.length}`);

    // Take the first 4 games from the filtered results without any sorting
    // Games are displayed in their original API response order
    const firstFourGames = activeGamesWithImages.slice(0, 4);

    console.log(`🎯 Returning first ${firstFourGames.length} games in original API order`);
    console.log('📋 All filtered games:', activeGamesWithImages.map((g: any) => `${g.game_name} (ID: ${g.game_id})`));
    console.log('🏆 Selected first 4 games:', firstFourGames.map((g: any) => `${g.game_name} (ID: ${g.game_id})`));

    // Transform the data for frontend use
    const transformedGames = firstFourGames.map((game: any) => {
      // Convert image URL to use our image serving API
      let imageUrl = game.image_url;
      if (imageUrl) {
        // Clean up the URL path
        if (imageUrl.startsWith('./')) {
          imageUrl = imageUrl.substring(2); // Remove './'
        } else if (imageUrl.startsWith('/')) {
          imageUrl = imageUrl.substring(1); // Remove leading '/'
        }

        // Convert to API serving URL
        if (!imageUrl.startsWith('http')) {
          imageUrl = `/api/serve-image/${imageUrl}`;
        }
      }

      return {
        id: game.game_id,
        name: game.game_name,
        description: game.description,
        minAge: game.min_age,
        maxAge: game.max_age,
        duration: game.duration_minutes,
        categories: game.categories || [],
        imageUrl: imageUrl,
        imagePriority: game.image_priority,
        isActive: game.game_is_active,
        createdAt: game.game_created_at,
        updatedAt: game.game_updated_at
      };
    });

    return NextResponse.json(transformedGames, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ Games with images API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
