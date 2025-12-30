import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/gallery-images/${params.id}`, {
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

        const response = await fetch(`${BACKEND_URL}/api/gallery-images/${params.id}`, {
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

        // 1. Fetch the image to get the path for deletion
        const getRes = await fetch(`${BACKEND_URL}/api/gallery-images/${params.id}`, {
            method: 'GET',
            headers: {
                ...(authHeader ? { 'Authorization': authHeader } : {}),
                'Content-Type': 'application/json',
            },
        });

        let imagePath = null;
        if (getRes.ok) {
            const imageData = await getRes.json();
            // Adjust based on if response is wrapped or direct
            const img = imageData.galleryImage || imageData;
            imagePath = img?.image_path;
        }

        // 2. Delete the record from backend
        const response = await fetch(`${BACKEND_URL}/api/gallery-images/${params.id}`, {
            method: 'DELETE',
            headers: {
                ...(authHeader ? { 'Authorization': authHeader } : {}),
            },
        });

        // 3. Delete the file if it exists locally
        if (imagePath) {
            let filePath = imagePath;
            // If the path is an API path, extract the actual file path
            if (filePath.startsWith('/api/serve-image')) {
                try {
                    const urlObj = new URL('http://localhost' + filePath);
                    filePath = urlObj.searchParams.get('path') || '';
                } catch (e) {
                    // ignore invalid URL
                }
            }

            if (filePath) {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
                await fetch(`${baseUrl}/api/files/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filePath }),
                }).catch(e => console.error("Failed to delete local file", e));
            }
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
