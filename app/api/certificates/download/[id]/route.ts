import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://ai.nibog.in/webhook/v1/nibog/certificates/download/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n download error:', errorText);
      throw new Error(`Failed to download certificate: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Download certificate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download certificate' },
      { status: 500 }
    );
  }
}
