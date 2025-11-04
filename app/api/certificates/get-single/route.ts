import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get('certificate_id');

    // Ensure certificateId exists and is a valid number
    if (!certificateId || isNaN(parseInt(certificateId))) {
      return NextResponse.json(
        { error: 'Valid Certificate ID is required' },
        { status: 400 }
      );
    }
    
    // Convert to numeric ID to ensure it's not sent as a string or undefined
    const numericCertificateId = parseInt(certificateId, 10);

    console.log(`Fetching certificate with ID: ${certificateId}`);

    // Set a timeout to abort the request if it takes too long
    const timeoutMs = 15000; // 15 seconds
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

    try {
      // Using the correct endpoint and method based on the API documentation
      const response = await fetch(
        `https://ai.nibog.in/webhook/v1/nibog/certificates/get`,
        {
          method: 'POST', // Changed to POST based on API documentation
          headers: {
            'Content-Type': 'application/json',
          },
          // Send numeric id in the body for POST request as expected by external API
          body: JSON.stringify({ id: numericCertificateId }),
          signal: abortController.signal,
        }
      );

      // Clear timeout since request completed
      clearTimeout(timeoutId);
      
      console.log(`External API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`n8n certificates/get-all error (${response.status}):`, errorText);
        
        return NextResponse.json({ 
          error: `Failed to fetch certificates from external API: ${response.status}`,
          details: errorText
        }, { status: response.status });
      }
      
      let result = await response.json();
      console.log(`Retrieved ${Array.isArray(result) ? result.length : 'unknown'} certificates`);
      
      // Find the specific certificate by ID
      if (Array.isArray(result)) {
        const certificate = result.find(cert => cert.id.toString() === certificateId.toString());
        
        if (!certificate) {
          return NextResponse.json({ error: `Certificate with ID ${certificateId} not found` }, { status: 404 });
        }
        
        // Extract data from certificate_data if it exists
        const certificateData = certificate.certificate_data || {};
        
        // Return a normalized certificate object
        const normalizedCertificate = {
          id: certificate.id || `cert-${Math.random().toString(36).substr(2, 9)}`,
          event_id: certificate.event_id || null,
          // Extract event info from certificate_data
          event_title: certificateData.event_name || certificate.event_title || 'Event Name Not Available',
          event_date: certificate.event_date || certificateData.event_date || new Date().toISOString().split('T')[0],
          venue_name: certificateData.venue_name || certificate.venue_name || 'Venue Not Available',
          city_name: certificateData.city_name || certificate.city_name || '',
          certificate_number: certificateData.certificate_number || '',
          
          // User/participant info
          user_id: certificate.user_id || certificate.participant_id || null,
          user_name: certificate.parent_name || certificate.user_name || 'Parent Name Not Available',
          user_email: certificate.parent_email || certificate.user_email || 'Email Not Available',
          // Include both child_id and child_name
          child_id: certificate.child_id || null,
          child_name: certificate.child_name || 'Participant Name Not Available',
          game_name: certificate.game_name || 'Game Not Available',

          // Include parent fields (now correctly mapped in database)
          parent_name: certificate.parent_name || null,
          parent_email: certificate.parent_email || null,
          
          template_id: certificate.template_id || null,
          certificate_url: certificate.certificate_url || certificate.pdf_url || null,
          status: certificate.status || 'unknown',
          generated_at: certificate.generated_at || new Date().toISOString(),
          sent_at: certificate.sent_at || null,
          downloaded_at: certificate.downloaded_at || null,
          
          // Keep the raw data for reference
          raw_certificate_data: certificateData
        };
        
        return NextResponse.json(normalizedCertificate);
      } else {
        return NextResponse.json({ error: 'Invalid response format from external API' }, { status: 500 });
      }
    } catch (error) {
      // Clear timeout in case of error
      clearTimeout(timeoutId);
      
      console.error('Error fetching certificate:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch certificate',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ 
      error: 'Error processing request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
