import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Server API route: Fetching partners...");

    const apiUrl = 'https://ai.nibog.in/webhook/partners';
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log(`Server API route: Get partners response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server API route: Error response:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch partners. API returned status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Server API route: Partners fetched successfully");
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error fetching partners:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch partners" },
      { status: 500 }
    );
  }
}
