import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL;
    
    if (!backendUrl) {
      console.error('BACKEND_URL is not defined in environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const apiUrl = `${backendUrl}/api/events/completed`;

    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to fetch completed events' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error in completed events API route:', error);
    
    // Check if it's a connection refused error (backend not running)
    if (error.cause?.code === 'ECONNREFUSED' || error.code === 'ECONNREFUSED') {
      console.error(`Backend server not reachable at ${process.env.BACKEND_URL}. Please ensure the backend server is running.`);
      return NextResponse.json({ 
        success: false, 
        error: 'Backend server not available',
        message: `Cannot connect to backend server at ${process.env.BACKEND_URL}. Please ensure the backend is running.`,
        hint: 'Start your backend server or check BACKEND_URL in .env file'
      }, { status: 503 });
    }
    
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred', message: error.message },
      { status: 500 }
    );
  }
}
