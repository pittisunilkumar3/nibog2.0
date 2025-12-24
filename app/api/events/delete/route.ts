import { NextResponse } from 'next/server';
import { readdir, unlink } from 'fs/promises';
import { join, isAbsolute, basename } from 'path';
import { existsSync } from 'fs';

// Use environment variable for API base URL or fallback to local development
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function POST(request: Request) {

  try {
    // Parse the request body
    const data = await request.json();
    const id = Number(data.id);
    if (!id || isNaN(id) || id <= 0) {
      console.error("Invalid event ID:", id);
      return NextResponse.json(
        { error: "Invalid event ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    // 1. Delete event image using image_url from the event object in the API response (robust, works in dev/prod)
    if (typeof data.image_url === 'string' && data.image_url.length > 0) {
      try {
        // Only use the filename, ignore any path for security and cross-env compatibility
        const filename = basename(data.image_url);
        const uploadDir = join(process.cwd(), 'upload', 'eventimages');
        const filePath = join(uploadDir, filename);
        console.log(`[Event Delete] Attempting to delete:`, filePath);
        if (existsSync(filePath)) {
          await unlink(filePath);
          console.log(`[Event Delete] Deleted image file: ${filePath}`);
        } else {
          console.warn(`[Event Delete] File does not exist: ${filePath}`);
        }
      } catch (err) {
        console.warn(`[Event Delete] Failed to delete image file: ${data.image_url}`, err);
      }
    }

    // ...existing code for auth and backend event deletion...
    let authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const authTokenMatch = cookieHeader.match(/auth-token=([^;]+)/);
        const superadminTokenMatch = cookieHeader.match(/superadmin-token=([^;]+)/);
        const token = authTokenMatch?.[1] || superadminTokenMatch?.[1];
        if (token) {
          authHeader = `Bearer ${token}`;
        }
      }
    }
    if (!authHeader) {
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
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
    });
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      if (response.ok) {
        responseData = { success: true, message: "Event deleted successfully" };
      } else {
        return NextResponse.json(
          { error: `Failed to delete event. Status: ${response.status}` },
          { status: response.status }
        );
      }
    }
    if (!response.ok) {
      return NextResponse.json(responseData, { status: response.status });
    }
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Error in DELETE event API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
