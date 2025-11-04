import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { promo_code_id } = body

    if (!promo_code_id) {
      return NextResponse.json(
        { error: 'promo_code_id is required' },
        { status: 400 }
      )
    }

    const n8nWebhookUrl = 'https://ai.nibog.in/webhook/v1/nibog/promocode/rollback-usage'

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: parseInt(promo_code_id)
      }),
    })

    if (!n8nResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to rollback promo code usage' },
        { status: 500 }
      )
    }

    const rollbackResult = await n8nResponse.json()
    return NextResponse.json(rollbackResult)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
