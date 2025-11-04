import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: POST /api/customer/profile
 * Proxy endpoint to fetch customer profile from external API
 * This bypasses CORS restrictions by making the request server-side
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { user_id } = body

    // Validate user_id
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    console.log('Fetching customer profile for user_id:', user_id)

    // Make the request to the external API
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/customer/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id }),
    })

    // Check if the response is ok
    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `External API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Parse the response
    const data = await response.json()
    console.log('Customer profile fetched successfully for user_id:', user_id)

    // Return the data with CORS headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error fetching customer profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}

