import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('Home slider API: Fetching images from external API...');
    
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
    console.log('Home slider API: Force refresh:', forceRefresh);
    console.log('Home slider API: Timestamp:', timestamp);
    
    const response = await fetch(`https://ai.nibog.in/webhook/v1/nibog/homesection/get?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    
    console.log('Home slider API: External API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Home slider API: External API response data:', data);
    
    // Process the data
    const processedData = Array.isArray(data) 
      ? data.filter((img: any) => img.status === "active")
      : [];
    
    console.log('Home slider API: Processed data:', processedData);
    
    // Return with no-cache headers
    return NextResponse.json(processedData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Timestamp': timestamp.toString(),
        'X-Count': processedData.length.toString()
      }
    });
    
  } catch (error) {
    console.error('Home slider API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch slider images',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
}
