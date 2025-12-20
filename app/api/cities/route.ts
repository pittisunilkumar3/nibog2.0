import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const withVenues = searchParams.get('withVenues');

        const endpoint = withVenues === 'true'
            ? `${BACKEND_URL}/api/city/with-venues/list`
            : `${BACKEND_URL}/api/city/`;

        // If backend is unreachable, fetch() will throw — catch it and return a 503
        // with an empty data array so public pages can fall back gracefully.
        let response;
        try {
            response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });
        } catch (err) {
            console.error(`Failed to reach backend at ${endpoint}:`, err);
            return NextResponse.json(
                { success: false, message: 'Backend unreachable', data: [] },
                { status: 503 }
            );
        }

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('City API Proxy GET Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('Authorization');

        const response = await fetch(`${BACKEND_URL}/api/city/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { 'Authorization': authHeader } : {}),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('City API Proxy POST Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
