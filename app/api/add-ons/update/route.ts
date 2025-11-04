import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();

    // Validate required fields
    if (!requestData.id || !requestData.name || !requestData.description || !requestData.price || !requestData.category) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, description, price, category" },
        { status: 400 }
      );
    }

    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/addons/update";

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API returned error status: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

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
      { error: error.message || "Failed to update add-on" },
      { status: 500 }
    );
  }
}
