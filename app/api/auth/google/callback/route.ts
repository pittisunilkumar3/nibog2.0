import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { error: 'No credential provided' },
        { status: 400 }
      )
    }

    console.log('Sending Google token to backend:', BACKEND_API)

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
    console.log('Backend response status:', response.status)
    console.log('Backend response data:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('Backend error:', data)
      return NextResponse.json(
        { error: data.error || data.message || 'Authentication failed' },
        { status: response.status }
      )
    }

    // Log the structure to help debug
    console.log('Response structure check:')
    console.log('- data.success:', data.success)
    console.log('- data.token:', data.token?.substring(0, 20) + '...')
    console.log('- data.user:', data.user)
    console.log('- data.data:', data.data)

    // Return the response from the backend as-is
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Google OAuth Callback Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
