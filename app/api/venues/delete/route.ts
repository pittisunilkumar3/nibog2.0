import { NextResponse } from 'next/server';
import { VENUES_REST_API } from '@/config/api';

// Force dynamic to allow no-store fetches to backend during runtime
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const authHeader = request.headers.get('Authorization');

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid venue ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    const apiUrl = `${VENUES_REST_API.BASE}/${id}`;


    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API error status: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Error deleting venue:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to delete venue" },
      { status: 500 }
    );
  }
}
