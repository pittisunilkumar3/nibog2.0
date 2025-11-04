import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, game_ids } = body

    if (!event_id || !game_ids || !Array.isArray(game_ids) || game_ids.length === 0) {
      return NextResponse.json(
        { error: 'event_id and game_ids array are required' },
        { status: 400 }
      )
    }

    const n8nWebhookUrl = 'https://ai.nibog.in/webhook/v1/nibog/promocode/get-by-event-games'

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: parseInt(event_id),
        game_ids: game_ids.map((id: any) => parseInt(id))
      }),
    })

    if (!n8nResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch promo codes from n8n' },
        { status: 500 }
      )
    }

    const promoCodesData = await n8nResponse.json()
    return NextResponse.json(promoCodesData)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
