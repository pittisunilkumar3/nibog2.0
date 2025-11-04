import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/addons/get-all";

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Validate that we have an array
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid API response format" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timeout - the add-on service is taking too long to respond" },
        { status: 504 }
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: "Unable to connect to add-on service" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to get add-ons" },
      { status: 500 }
    );
  }
}
