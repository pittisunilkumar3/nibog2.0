import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const footerData = await request.json();

    // Get the backend URL from environment variable (fallback for local dev)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3004';
    const apiUrl = `${backendUrl}/api/footer-settings`;

    // Forward the authorization token from the incoming request
    const authHeader = request.headers.get('authorization');

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(footerData),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server API route: Error response:", errorText);
      return NextResponse.json(
        { error: `Failed to create footer settings. API returned status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Server API route: Error creating footer settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create footer settings" },
      { status: 500 }
    );
  }
}
