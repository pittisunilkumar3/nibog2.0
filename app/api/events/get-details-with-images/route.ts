import { NextResponse } from 'next/server';
import { getAllEventsWithImagesFormatted } from '@/services/eventDetailsService';

export async function GET() {
  try {
    const events = await getAllEventsWithImagesFormatted();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching event details with images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event details with images' },
      { status: 500 }
    );
  }
}
