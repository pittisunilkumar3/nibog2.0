// Force dynamic rendering - disable static generation and caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/city/booking-info/list
 * Fetch all active cities with their events, available games, time slots, and real-time availability
 */
import { promises as fs } from 'fs'
import path from 'path'

// Timeout wrapper for fetch calls
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 15000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Fetch timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

export async function GET() {
  try {
    const candidates = [process.env.NEXT_PUBLIC_BACKEND_URL, process.env.BACKEND_URL, "http://localhost:3004"].filter(Boolean);

    // Try each candidate in order until we get a response with events
    for (const baseUrl of candidates) {
      try {
        const backendRes = await fetchWithTimeout(
          `${baseUrl.replace(/\/$/, '')}/api/city/booking-info/list`,
          {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          },
          15000 // 15 second timeout
        );

        if (!backendRes.ok) {
          continue; // try next candidate
        }

        const text = await backendRes.text();
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          continue;
        }

        // If backend returns success, use it (even if empty - that's valid!)
        if (parsed.success && Array.isArray(parsed?.data)) {
          return new Response(text, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0",
              "Pragma": "no-cache",
              "Expires": "0",
              "X-Content-Type-Options": "nosniff",
              "Surrogate-Control": "no-store"
            },
          });
        }

        // Backend returned unexpected structure - try next
      } catch (e) {
        continue; // try next candidate
      }
    }

    // Fallback: try to read local sample data for dev/testing
    try {
      // Try the fixed fallback first if it exists
      const fixedPath = path.join(process.cwd(), 'booking_info_clean_fixed.json');
      try {
        const fixedContent = await fs.readFile(fixedPath, 'utf-8');
        return new Response(fixedContent, {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0",
            "Pragma": "no-cache",
            "Expires": "0",
            "X-Content-Type-Options": "nosniff",
            "Surrogate-Control": "no-store"
          },
        });
      } catch (fixedErr) {
        // Fixed fallback not present, proceed to try original file
      }

      const filePath = path.join(process.cwd(), 'booking_info_clean.json');
      const content = await fs.readFile(filePath, 'utf-8');

      // Try to sanitize and parse the content in a tolerant way
      try {
        let sanitized = content.trim();
        sanitized = sanitized.replace(/\/\/.*$/gm, '');
        sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
        sanitized = sanitized.replace(/,\s*([}\]])/g, '$1');

        const firstBrace = sanitized.indexOf('{');
        const lastBrace = sanitized.lastIndexOf('}');
        if (firstBrace > 0 || lastBrace < sanitized.length - 1) {
          sanitized = sanitized.slice(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(sanitized);
        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          },
        });
      } catch (e) {
        return new Response(content, {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          },
        });
      }
    } catch (fileErr: any) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch booking information from backend and local fallback not available',
          details: fileErr.message
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
    
  } catch (error: any) {
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
