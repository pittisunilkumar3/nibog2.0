// Event Game service for handling event-game-slots API calls

export interface EventGame {
  game_id: number;
  game_title: string;
  game_description: string;
  min_age: number;
  max_age: number;
  duration_minutes: number;
  categories: string[];
  custom_title: string;
  custom_description: string;
  custom_price: number;
  start_time: string;
  end_time: string;
  slot_price: number;
  max_participants: number;
}

export interface EventCity {
  city_id: number;
  city_name: string;
  state: string;
  is_active: boolean;
}

export interface EventVenue {
  venue_id: number;
  venue_name: string;
  address: string;
  capacity: number;
  is_active: boolean;
}

export interface EventWithGames {
  event_id: number;
  event_title: string;
  event_description: string;
  event_date: string;
  event_status: string;
  city: EventCity;
  venue: EventVenue;
  games: EventGame[];
}

/**
 * Get all events with their games
 * @returns A list of all events with their associated games
 */
export async function getAllEventsWithGames(): Promise<EventWithGames[]> {
  console.log("Fetching all events with games");

  try {
    // Use our internal API route to avoid CORS issues and enable caching
    const response = await fetch('/api/events/get-all-with-games', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Get all events with games response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Retrieved events with games:", data);

    return data;
  } catch (error) {
    console.error("Error fetching events with games:", error);
    throw error;
  }
}

/**
 * Get a simplified list of events for dropdowns/selectors
 * @returns A simplified list of events with basic info
 */
export async function getEventsForSelector(): Promise<Array<{id: string, name: string, games: Array<{id: string, name: string}>}>> {
  try {
    const eventsWithGames = await getAllEventsWithGames();
    
    return eventsWithGames.map(event => ({
      id: event.event_id.toString(),
      name: event.event_title,
      games: event.games.map(game => ({
        id: game.game_id.toString(),
        name: game.custom_title || game.game_title
      }))
    }));
  } catch (error) {
    console.error("Error fetching events for selector:", error);
    throw error;
  }
}

/**
 * Get all unique games across all events
 * @returns A list of all unique games
 */
export async function getAllGamesFromEvents(): Promise<Array<{id: string, name: string, eventName: string}>> {
  try {
    const eventsWithGames = await getAllEventsWithGames();
    const allGames: Array<{id: string, name: string, eventName: string}> = [];
    
    eventsWithGames.forEach(event => {
      event.games.forEach(game => {
        allGames.push({
          id: `${event.event_id}-${game.game_id}`,
          name: game.custom_title || game.game_title,
          eventName: event.event_title
        });
      });
    });
    
    return allGames;
  } catch (error) {
    console.error("Error fetching all games from events:", error);
    throw error;
  }
}
