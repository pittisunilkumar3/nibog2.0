import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.template_id || !body.certificate_data) {
      return NextResponse.json(
        { error: 'Template ID and certificate data are required' },
        { status: 400 }
      );
    }

    // Generate preview HTML for the certificate
    const response = await fetch(
      'https://ai.nibog.in/webhook/v1/nibog/certificates/download/0',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n preview error:', errorText);
      throw new Error(`Failed to generate preview: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
