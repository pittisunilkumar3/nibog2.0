import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const id = requestData.id;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid add-on ID. ID must be a number." },
        { status: 400 }
      );
    }

    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/addons/get";

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(id) }),
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

    // Validate response
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: `Add-on with ID ${id} not found` },
        { status: 404 }
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
      { error: error.message || "Failed to get add-on" },
      { status: 500 }
    );
  }
}
