// Force dynamic rendering - disable static generation and caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/city/booking-info/list
 * Fetch all active cities with their events, available games, time slots, and real-time availability
 */
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const candidates = [process.env.NEXT_PUBLIC_BACKEND_URL, process.env.BACKEND_URL, "http://localhost:3004"].filter(Boolean);
    console.log('[booking-info route] Backend candidates:', candidates);

    // Try each candidate in order until we get a response with events
    for (const baseUrl of candidates) {
      try {
        console.log('[booking-info route] Trying backend URL:', baseUrl);
        const backendRes = await fetch(`${baseUrl.replace(/\/$/, '')}/api/city/booking-info/list`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        });

        console.log('[booking-info route] Response status from', baseUrl, ':', backendRes.status);

        if (!backendRes.ok) {
          const errorText = await backendRes.text().catch(() => '<no-body>');
          console.warn('[booking-info route] Backend returned non-ok response from', baseUrl, errorText);
          continue; // try next candidate
        }

        const text = await backendRes.text();
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          console.warn('[booking-info route] Failed to parse JSON from', baseUrl, e);
          continue;
        }

        // If backend returns success and at least one city with events, use it
        const hasEvents = Array.isArray(parsed?.data) && parsed.data.some((c:any) => Array.isArray(c.events) && c.events.length > 0);
        if (parsed.success && hasEvents) {
          console.log('[booking-info route] Using backend data from', baseUrl);
          return new Response(text, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0"
            },
          });
        }

        console.warn('[booking-info route] Backend at', baseUrl, 'returned success but no events. Trying next candidate.');
      } catch (e) {
        console.warn('[booking-info route] Error fetching from candidate', e);
        continue; // try next candidate
      }
    }

    console.warn('No working backend candidates returned event data, will try local fallback');

    // Fallback: try to read local sample data for dev/testing
    try {
      // Try the fixed fallback first if it exists
      const fixedPath = path.join(process.cwd(), 'booking_info_clean_fixed.json');
      try {
        const fixedContent = await fs.readFile(fixedPath, 'utf-8');
        console.log('Serving local fixed fallback booking_info_clean_fixed.json');
        return new Response(fixedContent, {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          },
        });
      } catch (fixedErr) {
        // Fixed fallback not present, proceed to try original file
        console.log('Fixed fallback not found, trying original file');
      }

      const filePath = path.join(process.cwd(), 'booking_info_clean.json');
      console.log('Attempting to read fallback file at', filePath, 'process.cwd()', process.cwd());
      const content = await fs.readFile(filePath, 'utf-8');

      // Try to sanitize and parse the content in a tolerant way (strip comments/trailing commas and extract braces)
      try {
        let sanitized = content.trim();
        // Remove JS comments
        sanitized = sanitized.replace(/\/\/.*$/gm, '');
        sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove trailing commas before ] or }
        sanitized = sanitized.replace(/,\s*([}\]])/g, '$1');

        const firstBrace = sanitized.indexOf('{');
        const lastBrace = sanitized.lastIndexOf('}');
        if (firstBrace > 0 || lastBrace < sanitized.length - 1) {
          sanitized = sanitized.slice(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(sanitized);
        console.log('Fallback parsed: cities=', Array.isArray(parsed.data) ? parsed.data.length : 'N/A');
        if (Array.isArray(parsed.data) && parsed.data[0]) {
          console.log('First city events length:', Array.isArray(parsed.data[0].events) ? parsed.data[0].events.length : 'N/A');
        }
        // Return sanitized JSON
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
        console.warn('Failed to parse fallback file as JSON (sanitized attempt failed):', e);
        console.log('Serving raw local fallback booking_info_clean.json');
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
      console.error('Local fallback failed:', fileErr);
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
