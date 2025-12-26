import { NextResponse } from 'next/server';

/**
 * GET /api/bookings/all
 * 
 * Get ALL bookings including both past and upcoming events with complete details.
 * Returns bookings with parent info, event details, children, games, and payment information.
 */
export async function GET(request: Request) {
  try {
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';
    const apiUrl = `${BACKEND_URL}/api/bookings/all`;

    console.log('Fetching all bookings from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache to always get fresh data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: `Failed to fetch bookings: ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('Successfully fetched bookings:', {
      success: data.success,
      count: data.count,
      hasData: !!data.data
    });

    // Return the complete response from backend
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching all bookings:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch all bookings',
        success: false,
        count: 0,
        data: []
      },
      { status: 500 }
    );
  }
}
