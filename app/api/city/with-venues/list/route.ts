// Force dynamic rendering - disable static generation and caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const baseUrl = process.env.BACKEND_URL || "http://localhost:3004";
    // Disable caching to always fetch fresh data
    const backendRes = await fetch(`${baseUrl}/api/city/with-venues/list`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
    if (!backendRes.ok) {
      return new Response(JSON.stringify({ message: "Failed to fetch from backend" }), {
        status: backendRes.status,
        headers: { "Content-Type": "application/json" },
      });
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
    return new Response(JSON.stringify({ message: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
