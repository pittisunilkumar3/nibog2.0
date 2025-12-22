import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);

    const fetchUrl = `${BACKEND_URL}/api/faq/faqs${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Failed to fetch FAQs' }));
      return NextResponse.json({ error: 'Failed to fetch FAQs', details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/faq/faqs:', error);
    return NextResponse.json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/api/faq/faqs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Failed to create FAQ' }));
      return NextResponse.json({ error: 'Failed to create FAQ', details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/faq/faqs:', error);
    return NextResponse.json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}