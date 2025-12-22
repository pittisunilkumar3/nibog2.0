import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
export async function GET() {
    try {
        const backendUrl = process.env.BACKEND_URL;
        console.log('API Route: Fetching refund policy from:', backendUrl);

        if (!backendUrl) {
            console.error('API Route: BACKEND_URL is missing');
            return NextResponse.json(
                { success: false, message: 'Backend URL not configured' },
                { status: 500 }
            );
        }

        const response = await fetch(`${backendUrl}/api/refund-policy`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        console.log('API Route: Backend response status:', response.status);

        if (!response.ok) {
            console.error('API Route: Backend returned error:', response.status);
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('API Route: Backend data received:', JSON.stringify(data).substring(0, 200) + '...');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching refund policy:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
            return NextResponse.json(
                { success: false, message: 'Backend URL not configured' },
                { status: 500 }
            );
        }

        const body = await request.json();

        // Get authorization token from request headers
        const authHeader = request.headers.get('authorization');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
            console.log('API Route: Forwarding authorization header for refund policy');
        }

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/api/refund-policy`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { success: false, message: errorData.message || `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating refund policy:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
