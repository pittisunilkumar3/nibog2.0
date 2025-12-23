import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const eventId = url.searchParams.get('event_id');
    const limit = url.searchParams.get('limit') || '100';
    const offset = url.searchParams.get('offset') || '0';
    const status = url.searchParams.get('status');
    
    
    // Build the query parameters for the external API
    let apiUrl = 'https://ai.nibog.in/webhook/v1/nibog/certificates/get-all';
    const params = new URLSearchParams();
    
    if (eventId) {
      params.append('event_id', eventId);
    }
    
    if (status) {
      params.append('status', status);
    }
    
    params.append('limit', limit);
    params.append('offset', offset);
    
    // Add query parameters to the URL
    if (params.toString()) {
      apiUrl += '?' + params.toString();
    }
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Fetch from the external API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      // Clear timeout since request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`n8n certificates/get-all error (${response.status}):`, errorText);
        
        // Return a more detailed error instead of throwing
        return NextResponse.json({ 
          error: `Failed to fetch certificates from external API: ${response.status}`,
          details: errorText
        }, { status: response.status });
      }
      
      let result = await response.json();
      
      // Ensure required fields exist in the certificates data
      if (Array.isArray(result)) {
        result = result.map(cert => {
          // Extract data from certificate_data if it exists
          const certificateData = cert.certificate_data || {};
          
          // Make sure all required fields exist
          return {
            id: cert.id || `cert-${Math.random().toString(36).substr(2, 9)}`,
            event_id: cert.event_id || null,
            // Extract event info from certificate_data
            event_title: certificateData.event_name || cert.event_title || 'Event Name Not Available',
            event_date: cert.event_date || certificateData.event_date || new Date().toISOString().split('T')[0],
            venue_name: certificateData.venue_name || cert.venue_name || 'Venue Not Available',
            city_name: certificateData.city_name || cert.city_name || '',
            certificate_number: certificateData.certificate_number || '',
            
            // User/participant info - use parent_name/email if available
            user_id: cert.user_id || cert.participant_id || null,
            user_name: cert.parent_name || 'Parent Name Not Available',
            user_email: cert.parent_email || 'Email Not Available',
            // Include both child_id and child_name
            child_id: cert.child_id || null,
            child_name: cert.child_name || 'Participant Name Not Available',
            game_name: cert.game_name || 'Game Not Available',

            // Include parent fields (now correctly mapped in database)
            parent_name: cert.parent_name || null,
            parent_email: cert.parent_email || null,
            
            template_id: cert.template_id || null,
            certificate_url: cert.certificate_url || cert.pdf_url || null,
            status: cert.status || 'generated',
            generated_at: cert.generated_at || cert.created_at || new Date().toISOString(),
            sent_at: cert.sent_at || null,
            downloaded_at: cert.downloaded_at || null,
            
            // Preserve the original data
            raw_certificate_data: certificateData,
            ...cert  // Keep any other fields from the original response
          };
        });
      }
      
      return NextResponse.json(result);
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timed out after 10 seconds');
        return NextResponse.json({ 
          error: 'Request timed out while fetching certificates from external API'
        }, { status: 504 });
      }
      throw fetchError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch certificates', 
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
