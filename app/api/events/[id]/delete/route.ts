import { NextRequest, NextResponse } from 'next/server';
import { readdir, unlink } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';

// Use environment variable for API base URL or fallback to local development
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/events/[id]/delete
 * Delete an event and its slots. Requires employee Bearer token authentication.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 DELETE API route called for event:', params.id);

  try {
    const id = Number(params.id);
    
    if (!id || isNaN(id) || id <= 0) {
      console.error("❌ Invalid event ID:", id);
      return NextResponse.json(
        { error: "Invalid event ID. ID must be a positive number." },
        { status: 400 }
      );
    }
    
    console.log('✅ Event ID validated:', id);

    // Get event details first to obtain image_url for cleanup
    let imageUrl: string | null = null;
    try {
      const eventResponse = await fetch(`${BACKEND_URL}/api/events/${id}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        imageUrl = eventData.image_url;
      }
    } catch (err) {
      console.warn(`[Event Delete] Could not fetch event details for cleanup: ${err}`);
    }

    // Delete event image if it exists
    if (typeof imageUrl === 'string' && imageUrl.length > 0) {
      try {
        // Only use the filename, ignore any path for security and cross-env compatibility
        const filename = basename(imageUrl);
        const uploadDir = join(process.cwd(), 'upload', 'eventimages');
        const filePath = join(uploadDir, filename);
        if (existsSync(filePath)) {
          await unlink(filePath);
          console.log(`✅ Deleted image file: ${filename}`);
        }
      } catch (err) {
        console.warn(`[Event Delete] Failed to delete image file: ${imageUrl}`, err);
      }
    }

    // Get authorization
    console.log('🔐 Getting authorization...');
    let authHeader = request.headers.get('authorization');
    console.log('🔐 Auth header from request:', authHeader ? 'Present' : 'None');
    
    if (!authHeader) {
      console.log('🔐 Checking cookies for auth token...');
      const cookieHeader = request.headers.get('cookie');
      console.log('🍪 Cookie header:', cookieHeader ? 'Present' : 'None');
      
      if (cookieHeader) {
        const authTokenMatch = cookieHeader.match(/auth-token=([^;]+)/);
        const superadminTokenMatch = cookieHeader.match(/superadmin-token=([^;]+)/);
        const token = authTokenMatch?.[1] || superadminTokenMatch?.[1];
        if (token) {
          authHeader = `Bearer ${token}`;
          console.log('✅ Auth token found in cookies');
        }
      }
    }
    
    if (!authHeader) {
      console.error('❌ No authentication token found');
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    };

    const backendUrl = `${BACKEND_URL}/api/events/${id}/delete`;
    console.log('🗑️ Deleting event:', { id, backendUrl });

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
    });

    const responseText = await response.text();
    console.log('📥 Backend response status:', response.status);
    console.log('📥 Backend response:', responseText.substring(0, 200));
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      if (response.ok) {
        console.log('✅ Event deleted successfully (no JSON response)');
        responseData = { 
          message: "Event deleted successfully",
          event_id: id 
        };
      } else {
        console.error('❌ Failed to delete event. Status:', response.status);
        return NextResponse.json(
          { error: `Failed to delete event. Backend returned status ${response.status}` },
          { status: response.status }
        );
      }
    }

    if (!response.ok) {
      return NextResponse.json(responseData, { status: response.status });
    }

    console.log('✅ Event deleted successfully');
    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error deleting event:', error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
