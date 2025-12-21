// Force dynamic rendering - disable static generation and caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/city/booking-info/list
 * Fetch all active cities with their events, available games, time slots, and real-time availability
 */
export async function GET() {
  try {
    const baseUrl = process.env.BACKEND_URL || "http://localhost:3004";
    
    // Fetch from backend API
    const backendRes = await fetch(`${baseUrl}/api/city/booking-info/list`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
    
    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      console.error("Backend error:", errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to fetch booking information from backend",
          details: errorText 
        }), 
        {
          status: backendRes.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Stream the backend response directly
    const text = await backendRes.text();
    return new Response(text, {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
    
  } catch (error: any) {
    console.error("Error fetching booking info:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch booking information",
        details: error.message
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
