import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;

    // Validate type
    const validTypes = ['participation', 'winner', 'event_specific'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid certificate type' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://ai.nibog.in/webhook/v1/nibog/certificate-templates/by-type/${type}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n by-type error:', errorText);
      throw new Error(`Failed to fetch templates by type: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Get templates by type error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch templates by type' },
      { status: 500 }
    );
  }
}
