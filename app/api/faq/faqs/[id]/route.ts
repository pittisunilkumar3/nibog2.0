import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const response = await fetch(`${BACKEND_URL}/api/faq/faqs/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Failed to fetch FAQ' }));
      return NextResponse.json({ error: 'Failed to fetch FAQ', details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/faq/faqs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/api/faq/faqs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Failed to update FAQ' }));
      return NextResponse.json({ error: 'Failed to update FAQ', details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/faq/faqs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/api/faq/faqs/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Failed to delete FAQ' }));
      return NextResponse.json({ error: 'Failed to delete FAQ', details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in DELETE /api/faq/faqs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}