import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function GET() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/homepage-sections`, {
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
        
        // Check if it's a connection refused error (backend not running)
        if (error.cause?.code === 'ECONNREFUSED' || error.code === 'ECONNREFUSED') {
            console.error(`Backend server not reachable at ${BACKEND_URL}. Please ensure the backend server is running.`);
            return NextResponse.json({ 
                success: false, 
                error: 'Backend server not available',
                message: `Cannot connect to backend server at ${BACKEND_URL}. Please ensure the backend is running.`,
                hint: 'Start your backend server or check BACKEND_URL in .env file'
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

        // Get token from auth-token or superadmin-token if needed
        // In this app, we usually pass the token in the headers of the request from the frontend
        // but the backend doc says Bearer token is required.
        // If we're proxying, we can pass through the Authorization header if present.
        const authHeader = request.headers.get('Authorization');

        const response = await fetch(`${BACKEND_URL}/api/homepage-sections`, {
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
        
        // Check if it's a connection refused error (backend not running)
        if (error.cause?.code === 'ECONNREFUSED' || error.code === 'ECONNREFUSED') {
            console.error(`Backend server not reachable at ${BACKEND_URL}. Please ensure the backend server is running.`);
            return NextResponse.json({ 
                success: false, 
                error: 'Backend server not available',
                message: `Cannot connect to backend server at ${BACKEND_URL}. Please ensure the backend is running.`,
                hint: 'Start your backend server or check BACKEND_URL in .env file'
            }, { status: 503 });
        }
        
        return NextResponse.json({ 
            success: false, 
            error: 'Internal Server Error',
            message: error.message || 'An unexpected error occurred' 
        }, { status: 500 });
    }
}
