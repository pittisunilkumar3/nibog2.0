import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { promo_code, event_id, game_ids, amount } = body

    if (!promo_code || !event_id || !game_ids || !Array.isArray(game_ids) || game_ids.length === 0 || !amount) {
      return NextResponse.json(
        { error: 'promo_code, event_id, game_ids array, and amount are required' },
        { status: 400 }
      )
    }

    const n8nWebhookUrl = 'https://ai.nibog.in/webhook/v1/nibog/promocode/validate'

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promo_code: promo_code.trim(),
        event_id: parseInt(event_id),
        game_ids: game_ids.map((id: any) => parseInt(id)),
        total_amount: parseFloat(amount)
      }),
    })

    if (!n8nResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to validate promo code' },
        { status: 400 }
      )
    }

    const validationResult = await n8nResponse.json()
    return NextResponse.json(validationResult)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
