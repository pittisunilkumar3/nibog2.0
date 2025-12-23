import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { game_id } = body

    // Validate required fields
    if (!game_id) {
      return NextResponse.json(
        { error: 'game_id is required' },
        { status: 400 }
      )
    }

    // Validate game_id is a number
    if (isNaN(parseInt(game_id))) {
      return NextResponse.json(
        { error: 'Invalid game_id: must be a number' },
        { status: 400 }
      )
    }


    // Prepare the payload for the external webhook
    const webhookPayload = {
      game_id: parseInt(game_id)
    }

    // Send to external webhook
    const webhookResponse = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('External delete webhook failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to delete game image in external system', details: errorText },
        { status: 500 }
      )
    }

    const webhookResult = await webhookResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Game image deleted successfully',
      data: webhookResult
    })

  } catch (error) {
    console.error('Game image delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
