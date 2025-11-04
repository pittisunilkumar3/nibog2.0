import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.template_id || !body.event_id || !body.user_id || !body.certificate_data) {
      return NextResponse.json(
        { error: 'Missing required fields: template_id, event_id, user_id, certificate_data' },
        { status: 400 }
      );
    }

    const response = await fetch(
      'https://ai.nibog.in/webhook/v1/nibog/certificate/generate-single',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n generate-single error:', errorText);
      throw new Error(`Failed to generate certificate: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Generate certificate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
