import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {

    const apiUrl = 'https://ai.nibog.in/webhook/v1/nibog/footer_setting/get';

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(null, { status: 404 });
      }
      
      const errorText = await response.text();
      console.error("Server API route: Error response:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch footer settings. API returned status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error fetching footer settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch footer settings" },
      { status: 500 }
    );
  }
}
