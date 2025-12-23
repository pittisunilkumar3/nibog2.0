import { NextResponse } from 'next/server';

/**
 * API endpoint to get game details by slot ID
 * This endpoint fetches the complete game details from event_games_with_slots table
 * using the slot_id stored in the booking record
 */
export async function GET(
  _request: Request,
  { params }: { params: { slotId: string } }
) {
  try {
    const slotId = params.slotId;

    if (!slotId) {
      return NextResponse.json(
        { error: "Slot ID is required" },
        { status: 400 }
      );
    }


    // Call the existing event-game-slot API to get slot details
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/event-game-slot/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: parseInt(slotId) })
    });

    if (!response.ok) {
      console.error(`Failed to fetch slot details: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to fetch slot details: ${response.status}` },
        { status: response.status }
      );
    }

    const slotDataArray = await response.json();
    console.log('Slot data retrieved:', slotDataArray);

    // The API returns an array, so we need to get the first item
    if (!slotDataArray || !Array.isArray(slotDataArray) || slotDataArray.length === 0) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      );
    }

    const slotData = slotDataArray[0]; // Get the first (and should be only) item

    // Return the complete slot details
    return NextResponse.json({
      success: true,
      slot_id: slotData.id,
      event_id: slotData.event_id,
      game_id: slotData.game_id,
      custom_title: slotData.custom_title,
      custom_description: slotData.custom_description,
      custom_price: slotData.custom_price,
      slot_price: slotData.slot_price,
      start_time: slotData.start_time,
      end_time: slotData.end_time,
      max_participants: slotData.max_participants,
      created_at: slotData.created_at,
      updated_at: slotData.updated_at
    });

  } catch (error: any) {
    console.error('Error fetching game details by slot ID:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch game details',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
