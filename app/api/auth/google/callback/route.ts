import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { error: 'No credential provided' },
        { status: 400 }
      )
    }

    console.log('Sending Google token to backend...')

    // Send the Google credential to the backend API
    const response = await fetch(`${BACKEND_API}/api/user/google-signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: credential, // Backend expects { "token": "..." }
      }),
    })

    const data = await response.json()
    console.log('Backend response:', data)

    if (!response.ok) {
      console.error('Backend error:', data)
      return NextResponse.json(
        { error: data.error || data.message || 'Authentication failed' },
        { status: response.status }
      )
    }

    // Return the response from the backend
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Google OAuth Callback Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
