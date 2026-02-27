import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Use the backend API to get booking by ID - this works for ALL bookings, not just active ones
    const apiUrl = `${BACKEND_URL}/api/bookings/${bookingId}`;

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If backend fails, try fallback to the webhook API for active events only
      if (response.status === 404) {
        // Try fallback to webhook API
        const fallbackResponse = await fetchFallbackBooking(bookingId);
        if (fallbackResponse) {
          return NextResponse.json(fallbackResponse, { status: 200 });
        }
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.error || `API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Handle the backend response format { success: true, data: booking }
    const booking = data.data || data;
    
    // Transform booking data to flat structure for ticket display
    const result = transformBookingForTicket(booking);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timeout - the booking service is taking too long to respond" },
        { status: 504 }
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: "Unable to connect to booking service" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to get booking" },
      { status: 500 }
    );
  }
}

/**
 * Transform booking data to a flat structure suitable for ticket display
 */
function transformBookingForTicket(booking: any) {
  const result: any = {
    // Booking identifiers
    booking_id: booking.id || booking.booking_id,
    booking_ref: booking.booking_ref,
    
    // Booking status
    booking_status: booking.status || booking.booking_status,
    status: booking.status || booking.booking_status,
    
    // Payment info
    total_amount: booking.total_amount,
    payment_status: booking.payment_status,
    payment_method: booking.payment_method,
    
    // Booking dates
    booking_created_at: booking.booking_date || booking.created_at,
    created_at: booking.booking_date || booking.created_at,
  };

  // Extract parent info
  if (booking.parent) {
    result.parent_name = booking.parent.name || booking.parent.parent_name;
    result.parent_email = booking.parent.email || booking.parent.parent_email;
    result.parent_phone = booking.parent.phone || booking.parent.parent_phone;
  }

  // Extract event info
  if (booking.event) {
    result.event_id = booking.event.id || booking.event.event_id;
    result.event_title = booking.event.name || booking.event.event_name;
    result.event_date = booking.event.date || booking.event.event_date;
    result.event_description = booking.event.description || booking.event.event_description;
    result.event_status = booking.event.status || booking.event.event_status;
    
    // Extract venue info from event
    if (booking.event.venue) {
      result.venue_id = booking.event.venue.id || booking.event.venue.venue_id;
      result.venue_name = booking.event.venue.name || booking.event.venue.venue_name;
      result.venue_address = booking.event.venue.address || booking.event.venue.venue_address;
      result.city_name = booking.event.venue.city || booking.event.venue.venue_city;
      result.city_state = booking.event.venue.state || booking.event.venue.venue_state;
    }
  }

  // Extract children info (support multiple children)
  if (Array.isArray(booking.children) && booking.children.length > 0) {
    // Keep all children data
    result.children = booking.children.map((child: any) => ({
      child_id: child.child_id || child.id,
      child_full_name: child.full_name || child.child_full_name,
      child_date_of_birth: child.date_of_birth || child.child_date_of_birth,
      child_gender: child.gender || child.child_gender,
      child_school_name: child.school_name || child.child_school_name,
    }));
    
    // First child info for backward compatibility
    const firstChild = booking.children[0];
    result.child_id = firstChild.child_id || firstChild.id;
    result.child_full_name = firstChild.full_name || firstChild.child_full_name;
    result.child_date_of_birth = firstChild.date_of_birth || firstChild.child_date_of_birth;
    result.child_gender = firstChild.gender || firstChild.child_gender;
    result.child_school_name = firstChild.school_name || firstChild.child_school_name;
    
    // Extract ALL games from ALL children with full details
    const allBookingGames: any[] = [];
    booking.children.forEach((child: any) => {
      if (Array.isArray(child.booking_games)) {
        child.booking_games.forEach((game: any) => {
          allBookingGames.push({
            game_id: game.game_id,
            game_name: game.game_name,
            game_description: game.game_description,
            game_price: game.game_price,
            slot_id: game.slot_id,
            slot_start_time: game.slot_start_time,
            slot_end_time: game.slot_end_time,
            slot_custom_title: game.slot_custom_title,
            child_name: child.full_name || child.child_full_name,
          });
        });
      }
    });
    
    // Store full booking games array for ticket display
    result.booking_games = allBookingGames;
    
    // Extract game info from first booking_game for backward compatibility
    if (allBookingGames.length > 0) {
      const firstGame = allBookingGames[0];
      result.game_id = firstGame.game_id;
      result.game_name = firstGame.game_name;
      result.game_description = firstGame.game_description;
      result.game_price = firstGame.game_price;
      result.start_time = firstGame.slot_start_time;
      result.end_time = firstGame.slot_end_time;
      result.slot_id = firstGame.slot_id;
      
      // Collect all game names for display
      result.all_games = allBookingGames.map((g: any) => g.game_name).filter(Boolean);
      
      // Calculate earliest start time and latest end time across all games
      const times = allBookingGames
        .filter((g: any) => g.slot_start_time)
        .map((g: any) => ({
          start: g.slot_start_time,
          end: g.slot_end_time
        }));
      
      if (times.length > 0) {
        // Sort by start time to get earliest
        times.sort((a: any, b: any) => a.start.localeCompare(b.start));
        result.earliest_start_time = times[0].start;
        // Find the latest end time
        result.latest_end_time = times.reduce((latest: string, t: any) => 
          t.end && (!latest || t.end.localeCompare(latest) > 0) ? t.end : latest, times[0].end);
      }
    }
  }

  // Extract payment info
  if (Array.isArray(booking.payments) && booking.payments.length > 0) {
    const payment = booking.payments[0];
    result.payment_id = payment.payment_id || payment.id;
    result.transaction_id = payment.transaction_id;
    result.payment_amount = payment.amount;
    result.payment_created_at = payment.payment_date || payment.created_at;
  }

  return result;
}

// Fallback function to fetch from webhook API (active events only)
async function fetchFallbackBooking(bookingId: string) {
  try {
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/get-all-active-event";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const allBookings = await response.json();

    if (!Array.isArray(allBookings)) {
      return null;
    }

    const booking = allBookings.find((b: any) =>
      String(b.booking_id) === String(bookingId)
    );

    if (!booking) {
      return null;
    }

    // Transform fallback data to match expected format
    const result: any = {
      booking_id: booking.booking_id,
      booking_ref: booking.booking_ref,
      booking_status: booking.status || booking.booking_status,
      status: booking.status || booking.booking_status,
      total_amount: booking.total_amount,
      payment_status: booking.payment_status,
      payment_method: booking.payment_method,
      booking_created_at: booking.created_at || booking.booking_created_at,
      created_at: booking.created_at || booking.booking_created_at,
    };

    // Extract child info from fallback format
    if (Array.isArray(booking.children) && booking.children.length > 0) {
      const child = booking.children[0];
      result.child_id = child.child_id;
      result.child_full_name = child.child_full_name || child.full_name;
      result.child_date_of_birth = child.child_date_of_birth || child.date_of_birth;
      result.child_gender = child.child_gender || child.gender;
      result.child_school_name = child.child_school_name || child.school_name;
      
      // Handle different games data structures in fallback
      if (Array.isArray(child.booking_games) && child.booking_games.length > 0) {
        result.game_name = child.booking_games[0].game_name;
        result.game_price = child.booking_games[0].game_price;
        result.start_time = child.booking_games[0].slot_start_time;
        result.end_time = child.booking_games[0].slot_end_time;
        result.all_games = child.booking_games.map((g: any) => g.game_name).filter(Boolean);
        result.booking_games = child.booking_games.map((g: any) => ({
          game_id: g.game_id,
          game_name: g.game_name,
          game_price: g.game_price,
          slot_start_time: g.slot_start_time,
          slot_end_time: g.slot_end_time,
          child_name: child.child_full_name || child.full_name,
        }));
      } else if (Array.isArray(child.games) && child.games.length > 0) {
        result.game_name = child.games[0].game_name;
        result.all_games = child.games.map((g: any) => g.game_name).filter(Boolean);
        result.booking_games = child.games.map((g: any) => ({
          game_name: g.game_name,
          child_name: child.child_full_name || child.full_name,
        }));
      } else if (typeof child.games === 'string') {
        result.game_name = child.games;
        result.all_games = [child.games];
        result.booking_games = [{ game_name: child.games, child_name: child.child_full_name || child.full_name }];
      } else {
        result.game_name = booking.game_name || 'NIBOG Event';
        result.all_games = [booking.game_name || 'NIBOG Event'];
        result.booking_games = [{ game_name: booking.game_name || 'NIBOG Event' }];
      }
    }

    // Extract event info from fallback format
    if (booking.event) {
      result.event_id = booking.event.event_id || booking.event.id;
      result.event_title = booking.event.event_name || booking.event.name;
      result.event_date = booking.event.event_date || booking.event.date;
      result.event_description = booking.event.event_description || booking.event.description;
      
      if (booking.event.venue) {
        result.venue_name = booking.event.venue.name || booking.event.venue.venue_name;
        result.venue_address = booking.event.venue.address || booking.event.venue.venue_address;
        result.city_name = booking.event.venue.city || booking.event.venue.city_name;
        result.city_state = booking.event.venue.state || booking.event.venue.state;
      }
    }

    return result;
  } catch (error) {
    console.error('Fallback booking fetch failed:', error);
    return null;
  }
}
