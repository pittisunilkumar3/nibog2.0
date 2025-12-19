// Baby game service - handles all baby game related API calls

export interface BabyGame {
  id?: number;
  game_name: string;
  image_url?: string;
  description?: string;
  min_age?: number;
  max_age?: number;
  duration_minutes?: number;
  categories: string[] | string;
  priority?: number;
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}

// Interface for games with images from the transformed API
export interface GameWithImage {
  id: number;
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  duration: number;
  categories: string[];
  imageUrl: string;
  imagePriority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

import { getSession } from "@/lib/auth/session";

/**
 * Get authentication headers with Bearer token
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getSession();
  return {
    "Content-Type": "application/json",
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * Create a new baby game
 * @param gameData The game data to create
 * @returns The created game
 */
export async function createBabyGame(gameData: BabyGame): Promise<BabyGame> {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch('/api/babygames/create', {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(gameData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.success && data.game ? data.game : (Array.isArray(data) ? data[0] : data);
  } catch (error) {
    throw error;
  }
}

/**
 * Get all baby games
 * @returns A list of all baby games
 */
export async function getAllBabyGames(): Promise<BabyGame[]> {
  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/babygames/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Ensure we return an array
    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all games with images from the external API (ALL games, not just first 4)
 * @returns A list of all games with images
 */
export async function getAllGamesWithImages(): Promise<GameWithImage[]> {
  try {
    // Use the new API endpoint that returns ALL games (not just first 4)
    const response = await fetch('/api/all-games-with-images', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Ensure we return an array
    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all active games with images (filtered version)
 * @returns A list of active games with images
 */
export async function getAllActiveGamesWithImages(): Promise<GameWithImage[]> {
  try {
    const allGames = await getAllGamesWithImages();

    // Filter for active games with images (using transformed data structure)
    const activeGames = allGames.filter(game =>
      game &&
      game.isActive === true &&
      game.imageUrl // Image URL exists means it has an image
    );

    return activeGames;
  } catch (error) {
    throw error;
  }
}

/**
 * Get a baby game by ID
 * @param id The ID of the baby game to get
 * @returns The baby game with the specified ID
 */
export async function getBabyGameById(id: number): Promise<BabyGame> {
  try {
    const response = await fetch('/api/babygames/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // The proxy already extracts the game from { success, game } or returns original
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update a baby game
 * @param gameData The game data to update
 * @returns The updated game
 */
export async function updateBabyGame(gameData: BabyGame): Promise<BabyGame> {
  if (!gameData.id) {
    throw new Error("Game ID is required for update");
  }

  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch('/api/babygames/update', {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(gameData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.success && data.game ? data.game : (Array.isArray(data) ? data[0] : data);
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a baby game
 * @param id The ID of the baby game to delete
 * @returns A success indicator
 */
export async function deleteBabyGame(id: number): Promise<{ success: boolean }> {
  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    throw new Error("Invalid game ID. ID must be a positive number.");
  }

  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch('/api/babygames/delete', {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ id: Number(id) }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete game. API returned status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return { success: data.success === true };
  } catch (error) {
    throw error;
  }
}

/**
 * Upload image for baby game
 * @param file The image file to upload
 * @returns Promise with the uploaded file path
 */
export async function uploadBabyGameImage(file: File): Promise<string> {
  try {
    console.log('Uploading baby game image...');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/babygames/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload baby game image');
    }

    const result = await response.json();
    console.log('Successfully uploaded baby game image:', result.path);
    return result.path;
  } catch (error) {
    console.error('Error uploading baby game image:', error);
    throw error;
  }
}

/**
 * Upload game image to the gamesimage directory
 * @param file The image file to upload
 * @returns Promise with upload result containing path and filename
 */
export async function uploadGameImage(file: File): Promise<{
  success: boolean;
  path: string;
  filename: string;
  originalName: string;
  size: number;
}> {
  console.log("Uploading game image:", file.name);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/gamesimage/upload', {
      method: 'POST',
      body: formData,
    });

    console.log(`Upload game image response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Game image uploaded:", data);

    return data;
  } catch (error) {
    console.error("Error uploading game image:", error);
    throw error;
  }
}

/**
 * Send game image data to external webhook
 * @param gameId The game ID
 * @param imageUrl The image URL/path
 * @param priority The priority of the image
 * @param isActive Whether the image is active
 * @returns Promise with webhook result
 */
export async function sendGameImageToWebhook(
  gameId: number,
  imageUrl: string,
  priority: number,
  isActive: boolean = true
): Promise<any> {
  console.log("Sending game image to webhook:", { gameId, imageUrl, priority, isActive });

  try {
    const response = await fetch('/api/gamesimage/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game_id: gameId,
        image_url: imageUrl,
        priority: priority,
        is_active: isActive,
      }),
    });

    console.log(`Game image webhook response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Webhook failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Game image webhook success:", data);

    return data;
  } catch (error) {
    console.error("Error sending game image to webhook:", error);
    throw error;
  }
}

/**
 * Fetch game images by game ID
 * @param gameId The game ID
 * @returns Promise with array of game images
 */
export async function fetchGameImages(gameId: number): Promise<any[]> {
  console.log("🎮 Fetching game images for game ID:", gameId);

  try {
    const response = await fetch('/api/gamesimage/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game_id: gameId,
      }),
    });

    console.log(`📡 Fetch game images response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error response: ${errorText}`);
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Game images fetched:", data);

    // Enhanced filtering to handle empty objects and invalid data
    if (Array.isArray(data)) {
      const validImages = data.filter(img =>
        img &&
        typeof img === 'object' &&
        img.id !== undefined &&
        img.image_url !== undefined &&
        img.image_url !== null &&
        img.image_url.trim() !== ''
      );

      console.log(`📊 Valid game images after filtering: ${validImages.length}`, validImages);
      return validImages;
    }

    // Handle case where API returns empty object or null
    console.log("⚠️ API returned non-array data:", typeof data);
    return [];
  } catch (error) {
    console.error("❌ Error fetching game images:", error);
    throw error;
  }
}

/**
 * Delete game images for a specific game
 * @param gameId The game ID
 * @returns Promise with delete result
 */
export async function deleteGameImages(gameId: number): Promise<any> {
  console.log("🗑️ Deleting game images for game ID:", gameId);

  try {
    const response = await fetch('/api/gamesimage/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game_id: gameId,
      }),
    });

    console.log(`Delete game images response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Delete error response: ${errorText}`);
      throw new Error(`Delete failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Game images delete success:", data);

    return data;
  } catch (error) {
    console.error("❌ Error deleting game images:", error);
    throw error;
  }
}

/**
 * Update game image using create strategy (since update endpoint is not available)
 * @param gameId The game ID
 * @param imageUrl The image URL/path
 * @param priority The priority of the image
 * @param isActive Whether the image is active
 * @returns Promise with update result
 */
export async function updateGameImage(
  gameId: number,
  imageUrl: string,
  priority: number,
  isActive: boolean = true
): Promise<any> {
  console.log("🔄 Updating game image using create strategy:", { gameId, imageUrl, priority, isActive });

  try {
    // Use the update API route which internally calls the create endpoint
    const response = await fetch('/api/gamesimage/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game_id: gameId,
        image_url: imageUrl,
        priority: priority,
        is_active: isActive,
      }),
    });

    console.log(`📡 Update game image response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Update API error response: ${errorText}`);
      throw new Error(`Update failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Game image update success:", data);

    return data;
  } catch (error) {
    console.error("❌ Error updating game image:", error);
    throw error;
  }
}

/**
 * Legacy update function (kept for compatibility, but uses new strategy)
 * @deprecated Use updateGameImage instead
 */
export async function updateGameImageLegacy(
  gameId: number,
  imageUrl: string,
  priority: number,
  isActive: boolean = true
): Promise<any> {
  console.log("⚠️ Using legacy update function - redirecting to new implementation");
  return updateGameImage(gameId, imageUrl, priority, isActive);
}
