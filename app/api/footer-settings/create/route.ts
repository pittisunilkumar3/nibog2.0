import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const footerData = await request.json();
    
    console.log("Server API route: Creating footer settings:", footerData);

    const apiUrl = 'https://ai.nibog.in/webhook/v1/nibog/footer_setting/post';
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(footerData),
      cache: "no-store",
    });

    console.log(`Server API route: Create footer settings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server API route: Error response:", errorText);
      return NextResponse.json(
        { error: `Failed to create footer settings. API returned status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Server API route: Footer settings created successfully");
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Server API route: Error creating footer settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create footer settings" },
      { status: 500 }
    );
  }
}
