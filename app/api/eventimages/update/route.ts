import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, image_url, priority, is_active } = body

    // Validate required fields
    if (!event_id || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields: event_id and image_url are required' },
        { status: 400 }
      )
    }

    // Validate event_id is a number
    if (isNaN(parseInt(event_id))) {
      return NextResponse.json(
        { error: 'Invalid event_id: must be a number' },
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

    console.log('Event image update request received:', {
      event_id: parseInt(event_id),
      image_url,
      priority: priority ? parseInt(priority) : 1,
      is_active: is_active !== undefined ? is_active : true
    })

    // Prepare the payload for the external webhook
    const webhookPayload = {
      event_id: parseInt(event_id),
      image_url: image_url, // This will be the local path like "./upload/eventimages/filename.jpg"
      priority: priority ? parseInt(priority) : 1,
      is_active: is_active !== undefined ? is_active : true
    }

    console.log('Sending to external update webhook:', webhookPayload)
    console.log('External webhook URL:', 'https://ai.nibog.in/webhook/nibog/eventimage/updated')

    // Send to external webhook
    const webhookResponse = await fetch('https://ai.nibog.in/webhook/nibog/eventimage/updated', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('External webhook failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to update event image in external system', details: errorText },
        { status: 500 }
      )
    }

    const webhookResult = await webhookResponse.json()
    console.log('External webhook response:', webhookResult)

    return NextResponse.json({
      success: true,
      message: 'Event image updated successfully',
      data: webhookResult
    })

  } catch (error) {
    console.error('Event image update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
