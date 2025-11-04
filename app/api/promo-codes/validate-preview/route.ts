import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Define subtotal at the function scope so it's available in the catch block
  let subtotal: number | string = 0;
  
  try {
    const body = await request.json()
    const { promocode, eventId, gameIds } = body
    subtotal = body.subtotal

    if (!promocode || !eventId || !gameIds || !Array.isArray(gameIds) || gameIds.length === 0 || !subtotal) {
      return NextResponse.json(
        { error: 'promocode, eventId, gameIds array, and subtotal are required' },
        { status: 400 }
      )
    }

    const n8nWebhookUrl = 'https://ai.nibog.in/webhook/v1/nibog/promocode/preview-validation'

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promocode: promocode.trim(),
        eventId: parseInt(eventId.toString()),
        gameIds: gameIds.map((id: any) => parseInt(id.toString())),
        subtotal: parseFloat(subtotal.toString())
      }),
    })

    if (!n8nResponse.ok) {
      return NextResponse.json(
        [
          {
            is_valid: false,
            discount_amount: 0,
            final_amount: parseFloat(subtotal.toString()),
            message: 'Invalid or inapplicable promo code.',
            promo_details: {}
          }
        ],
        { status: 200 }
      )
    }

    const validationResult = await n8nResponse.json()
    // Ensure the response is an array
    return NextResponse.json(Array.isArray(validationResult) ? validationResult : [validationResult])

  } catch (error) {
    // In the catch block, use a default value of 0
    let finalAmount = 0;
    try {
      if (typeof subtotal !== 'undefined' && subtotal !== null) {
        finalAmount = parseFloat(subtotal.toString());
      }
    } catch {
      // If parsing fails, keep finalAmount as 0
    }

    return NextResponse.json(
      [
        {
          is_valid: false,
          discount_amount: 0,
          final_amount: finalAmount,
          message: 'Invalid or inapplicable promo code.',
          promo_details: {}
        }
      ],
      { status: 200 }
    )
  }
}
