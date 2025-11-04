import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();

    // Validate required fields
    if (!requestData.name || !requestData.description || !requestData.price || !requestData.category) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, price, category" },
        { status: 400 }
      );
    }

    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/addons/create";

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

    // Get the response data
    const responseText = await response.text();

    let data;
    try {
      // Try to parse the response as JSON
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Failed to parse API response",
          rawResponse: responseText
        },
        { status: response.status }
      );
    }

    // Return the response with the appropriate status (like other working routes)
    return NextResponse.json(data, { status: response.status });
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
      { error: error.message || "Failed to create add-on" },
      { status: 500 }
    );
  }
}
