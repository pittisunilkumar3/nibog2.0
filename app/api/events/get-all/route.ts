import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3004";
    // Forward the admin flag: ?all=true returns inactive events too (for admin filters)
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true" ? "?all=true" : "";
    const apiUrl = BACKEND_URL + "/api/events/list" + all;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch events", details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
