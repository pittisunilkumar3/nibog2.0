import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {

    const body = await request.json();
    
    // Get the backend URL from environment variable
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3004';
    const apiUrl = `${backendUrl}/api/footer-settings/`;

    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization');
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server API route: Error response:", errorText);
      return NextResponse.json(
        { error: `Failed to update footer settings. API returned status: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error updating footer settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update footer settings" },
      { status: 500 }
    );
  }
}
