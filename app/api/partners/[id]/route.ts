import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:3004';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const response = await fetch(`${BACKEND}/api/partners/${id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: 'Failed to fetch partner', details: err }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const auth = request.headers.get('authorization');

    const response = await fetch(`${BACKEND}/api/partners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: 'Failed to update partner', details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = request.headers.get('authorization');

    // 1. Fetch the partner to get the image path
    const getRes = await fetch(`${BACKEND}/api/partners/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
      cache: 'no-store',
    });
    let imagePath = '';
    if (getRes.ok) {
      const partnerData = await getRes.json();
      imagePath = partnerData?.data?.image_url || partnerData?.image_url || '';
    }

    // 2. Delete the partner record
    const response = await fetch(`${BACKEND}/api/partners/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: 'Failed to delete partner', details: err }, { status: response.status });
    }

    // 3. Delete the image file if present and is an upload/partner image
    if (imagePath && imagePath.includes('upload/partner/')) {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}