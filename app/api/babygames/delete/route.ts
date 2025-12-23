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

    // 1. Fetch the game details to get the image path
    let imagePath = '';
    try {
      const getRes = await fetch(`${BABY_GAMES_REST_API.BASE}/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(authHeader ? { 'Authorization': authHeader } : {}) },
        cache: 'no-store',
      });
      if (getRes.ok) {
        const gameData = await getRes.json();
        // The new API returns { success: true, game: { ... } }
        const game = gameData.success && gameData.game ? gameData.game : gameData;
        imagePath = game?.image_url || game?.imageUrl || '';
      }
    } catch (e) {
      // Ignore fetch error, just don't delete image
    }

    // 2. Delete the game record
    const apiUrl = `${BABY_GAMES_REST_API.BASE}/${id}`;
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

    // 3. Delete the image file if present and is in upload/babygames, upload/gamesimage, or upload/gameimages
    if (imagePath && (imagePath.includes('upload/babygames/') || imagePath.includes('upload/gamesimage/') || imagePath.includes('upload/gameimages/'))) {
      let filePath = imagePath;
      // If the path is an API path, extract the actual file path
      if (filePath.startsWith('/api/serve-image')) {
        try {
          const urlObj = new URL('http://localhost' + filePath);
          filePath = urlObj.searchParams.get('path') || '';
        } catch {}
      }
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      await fetch(`${baseUrl}/api/files/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });
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
