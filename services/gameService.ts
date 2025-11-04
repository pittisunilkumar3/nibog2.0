export interface Game {
  id: number; // This is the slot_id for unique selection
  game_id: number; // This is the actual game_id for API calls
  game_title: string;
  game_description: string;
  min_age: number;
  max_age: number;
  game_duration_minutes: number;
  categories: string[];
  created_at?: string;
  updated_at?: string;
  // Additional fields from event games
  custom_price?: number;
  slot_price?: number;
  start_time?: string;
  end_time?: string;
  custom_title?: string;
  custom_description?: string;
  max_participants?: number;
  // Store slot_id separately for reference (this is the time slot identifier)
  slot_id?: number;
  // Note field for slot-specific instructions
  note?: string;
}

/**
 * Get games by age in months
 * @param ageInMonths Age in months to filter games by
 * @returns Promise with array of games suitable for the specified age
 */
export async function getGamesByAge(ageInMonths: number): Promise<Game[]> {
  console.log(`Fetching games for age: ${ageInMonths} months`);

  if (isNaN(ageInMonths) || ageInMonths < 0) {
    throw new Error("Invalid age. Age must be a positive number.");
  }

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/games/get-by-age', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ age: ageInMonths }),
    });

    console.log(`Get games by age response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} games for age ${ageInMonths} months`);

    return data;
  } catch (error) {
    console.error(`Error fetching games for age ${ageInMonths} months:`, error);
    throw error;
  }
}

/**
 * Get all games
 * @returns Promise with array of all games
 */
export async function getAllGames(): Promise<Game[]> {
  console.log("Fetching all games");

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/games/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Get all games response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} games`);

    return data;
  } catch (error) {
    console.error("Error fetching all games:", error);
    throw error;
  }
}
