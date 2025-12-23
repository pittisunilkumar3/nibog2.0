import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/homepage-sections/${params.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('Authorization');

        const response = await fetch(`${BACKEND_URL}/api/homepage-sections/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { 'Authorization': authHeader } : {}),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('Authorization');

        // 1. Fetch the section to get the image path
        const getRes = await fetch(`${BACKEND_URL}/api/homepage-sections/${params.id}`, {
            method: 'GET',
            headers: {
                ...(authHeader ? { 'Authorization': authHeader } : {}),
                'Content-Type': 'application/json',
            },
        });
        const sectionData = await getRes.json();
        const imagePath = sectionData?.data?.image_path;

        // If section not found, return 404
        if (!sectionData?.success || !sectionData?.data) {
            return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 });
        }

        // 2. Delete the section record
        const response = await fetch(`${BACKEND_URL}/api/homepage-sections/${params.id}`, {
            method: 'DELETE',
            headers: {
                ...(authHeader ? { 'Authorization': authHeader } : {}),
            },
        });

        // 3. Delete the image file if present
        if (imagePath) {
            // Use the path as-is for upload/blog/home images
            let filePath = imagePath;
            // If the path is an API path, extract the actual file path
            if (filePath.startsWith('/api/serve-image')) {
                const urlObj = new URL('http://localhost' + filePath);
                filePath = urlObj.searchParams.get('path') || '';
            }
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            await fetch(`${baseUrl}/api/files/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath }),
            });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
