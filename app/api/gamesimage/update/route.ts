import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { game_id, image_url, priority, is_active } = body

    // Validate required fields
    if (!game_id || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields: game_id and image_url are required' },
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

    // Validate priority if provided
    if (priority !== undefined && (isNaN(parseInt(priority)) || parseInt(priority) < 1 || parseInt(priority) > 10)) {
      return NextResponse.json(
        { error: 'Invalid priority: must be a number between 1 and 10' },
        { status: 400 }
      )
    }

    console.log('Game image update request received:', {
      game_id: parseInt(game_id),
      image_url,
      priority: priority ? parseInt(priority) : 1,
      is_active: is_active !== undefined ? is_active : true
    })

    // Prepare the payload for the external webhook
    const webhookPayload = {
      game_id: parseInt(game_id),
      image_url: image_url, // This will be the local path like "./upload/gamesimage/filename.jpg"
      priority: priority ? parseInt(priority) : 1,
      is_active: is_active !== undefined ? is_active : true
    }

    console.log('🔄 Calling games image update endpoint:', webhookPayload)
    console.log('📡 External webhook URL:', 'https://ai.nibog.in/webhook/nibog/gamesimage/update')
    console.log('💡 Using the correct update endpoint as specified by user')

    // Call the correct update endpoint as specified by user
    const webhookResponse = await fetch('https://ai.nibog.in/webhook/nibog/gamesimage/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    console.log(`📊 External webhook response status: ${webhookResponse.status}`)

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('❌ External update webhook failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to update game image in external system', details: errorText },
        { status: 500 }
      )
    }

    const webhookResult = await webhookResponse.json()
    console.log('✅ External update webhook response:', webhookResult)

    return NextResponse.json({
      success: true,
      message: 'Game image updated successfully',
      data: webhookResult
    })

  } catch (error) {
    console.error('Game image update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
