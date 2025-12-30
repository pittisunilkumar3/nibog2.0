import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function GET() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/gallery-images`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('API Error:', error);

        if (error.cause?.code === 'ECONNREFUSED' || error.code === 'ECONNREFUSED') {
            return NextResponse.json({
                success: false,
                error: 'Backend server not available',
                message: `Cannot connect to backend server at ${BACKEND_URL}.`
            }, { status: 503 });
        }

        return NextResponse.json({
            success: false,
            error: 'Internal Server Error',
            message: error.message || 'An unexpected error occurred'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('Authorization');

        const response = await fetch(`${BACKEND_URL}/api/gallery-images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { 'Authorization': authHeader } : {}),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('API Error:', error);

        if (error.cause?.code === 'ECONNREFUSED' || error.code === 'ECONNREFUSED') {
            return NextResponse.json({
                success: false,
                error: 'Backend server not available',
                message: `Cannot connect to backend server at ${BACKEND_URL}.`
            }, { status: 503 });
        }

        return NextResponse.json({
            success: false,
            error: 'Internal Server Error',
            message: error.message || 'An unexpected error occurred'
        }, { status: 500 });
    }
}
