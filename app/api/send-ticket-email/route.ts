import { NextResponse } from 'next/server';
import { sendTicketEmail, TicketEmailData } from '@/services/ticketEmailService';
import { getTicketDetails } from '@/services/bookingService';

/**
 * API endpoint to send ticket email manually
 * This can be used for testing or resending tickets
 * Uses existing API endpoints for email settings and sending
 */
export async function POST(request: Request) {
  try {
    const { bookingRef, bookingId } = await request.json();

    if (!bookingRef && !bookingId) {
      return NextResponse.json(
        { error: 'Either bookingRef or bookingId is required' },
        { status: 400 }
      );
    }

    // Get ticket details using existing service with retry mechanism
    let ticketDetails;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    if (bookingRef) {
      // Retry mechanism to handle database timing issues
      while (retryCount < maxRetries) {
        try {
          ticketDetails = await getTicketDetails(bookingRef);

          if (ticketDetails && ticketDetails.length > 0) {
            break;
          }

          if (retryCount < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        } catch (error) {
          console.error(`🎫 Error fetching ticket details (attempt ${retryCount + 1}):`, error);
          if (retryCount < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
        retryCount++;
      }
    } else {
      // If only bookingId provided, we need to fetch booking details first
      return NextResponse.json(
        { error: 'bookingRef is required for ticket email' },
        { status: 400 }
      );
    }

    if (!ticketDetails || ticketDetails.length === 0) {
      console.error(`🎫 Failed to retrieve ticket details after ${maxRetries} attempts for booking: ${bookingRef}`);
      return NextResponse.json(
        { error: 'No ticket details found for the provided booking reference after multiple attempts' },
        { status: 404 }
      );
    }

    const firstTicket = ticketDetails[0];

    // Prepare QR code data (same format as booking confirmation page)
    const qrCodeData = JSON.stringify({
      ref: bookingRef,
      id: firstTicket.booking_id,
      name: firstTicket.child_name || 'Child',
      game: firstTicket.custom_title || firstTicket.event_title || firstTicket.game_name || 'NIBOG Event',
      slot_id: firstTicket.event_game_slot_id || firstTicket.booking_game_id || 0
    });

    // Prepare ticket email data using available TicketDetails properties
    const ticketEmailData: TicketEmailData = {
      bookingId: firstTicket.booking_id,
      bookingRef: bookingRef,
      parentName: firstTicket.parent_name || 'Valued Customer',
      parentEmail: firstTicket.parent_email || firstTicket.user_email,
      childName: firstTicket.child_name || 'Child',
      eventTitle: firstTicket.event_title || 'NIBOG Event',
      eventDate: firstTicket.event_date || new Date().toLocaleDateString(),
      eventVenue: 'Event Venue', // Using fallback since event_venue is not in TicketDetails
      eventCity: '', // Using fallback since event_city is not in TicketDetails
      ticketDetails: ticketDetails,
      qrCodeData: qrCodeData
    };

    // Send ticket email
    const result = await sendTicketEmail(ticketEmailData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Ticket email sent successfully',
        recipient: ticketEmailData.parentEmail
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send ticket email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in send-ticket-email API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
