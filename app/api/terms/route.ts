import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3004';
    console.log('API Route: Fetching terms from:', backendUrl);

    const primaryUrl = `${backendUrl}/api/terms`;
    const fallbackWebhook = 'https://ai.nibog.in/webhook/v1/nibog/termsandconditionsget';

    // Try primary endpoint first
    let response = await fetch(primaryUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    // If primary fails, try the known webhook fallback
    if (!response.ok) {
      console.warn(`API Route: Primary endpoint ${primaryUrl} failed with status ${response.status}. Trying fallback webhook.`);
      try {
        response = await fetch(fallbackWebhook, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
      } catch (e) {
        console.error('API Route: Fallback webhook fetch failed:', e);
      }
    }

    console.log('API Route: Response status after fallbacks:', response ? response.status : 'no-response');

    if (!response || !response.ok) {
      const status = response ? response.status : 500;
      const text = response ? await response.text().catch(() => '') : '';
      console.error('API Route: Unable to fetch terms. Response:', status, text.substring ? text.substring(0,200) : text);
      return NextResponse.json({ success: false, message: `Failed to fetch terms. Status: ${status}` }, { status });
    }

    // Parse JSON if possible
    const contentType = response.headers.get('content-type') || '';
    let data: any;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // fallback: treat as plain text and wrap into expected shape
      const text = await response.text();
      data = { success: true, terms: { id: 1, html_content: text } };
    }

    console.log('API Route: Backend data received:', JSON.stringify(data).substring(0, 200) + '...');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching terms:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: 'Backend URL not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Don't normalize - pass body exactly as received (like refund-policy does)
    // Backend expects { terms_text: "..." } and will store it as html_content

    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization');

    // Extract token from cookies if Authorization header not present
    let forwardedAuth: string | null = null;
    if (authHeader) {
      forwardedAuth = authHeader;
      console.log('API Route: Forwarding authorization header for terms update');
    } else {
      const cookieHeader = request.headers.get('cookie') || '';
      if (cookieHeader) {
        const cookiePairs = cookieHeader.split(';').map(c => c.trim());
        const authTokenCookie = cookiePairs.find(c => c.startsWith('auth-token='));
        const superadminCookie = cookiePairs.find(c => c.startsWith('superadmin-token='));

        if (authTokenCookie) {
          const val = authTokenCookie.split('=')[1];
          if (val) forwardedAuth = `Bearer ${val}`;
        } else if (superadminCookie) {
          try {
            const raw = decodeURIComponent(superadminCookie.split('=')[1] || '');
            const parsed = JSON.parse(raw);
            if (parsed && parsed.token) forwardedAuth = `Bearer ${parsed.token}`;
          } catch (e) {
            console.warn('API Route: Failed to parse superadmin-token cookie', e);
          }
        }

        if (forwardedAuth) console.log('API Route: Extracted auth from cookies and will forward as Authorization header');
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (forwardedAuth) headers['Authorization'] = forwardedAuth;

    // Log normalized body for debugging (truncate to avoid huge logs)
    try {
      console.log('API Route: Forwarding terms update body (truncated):', JSON.stringify(body).substring(0,200));
    } catch (e) { /* ignore stringify errors */ }

    // Forward the request to the backend
    try {
      console.log('API Route: Forwarding headers: ', {
        'Content-Type': headers['Content-Type'],
        Authorization: headers['Authorization'] ? 'REDACTED' : 'none'
      })

      // Log whether body likely contains HTML
      try {
        const bodyPreview = (typeof body === 'string') ? body : JSON.stringify(body)
        const hasTags = /<[^>]+>/.test(bodyPreview)
        console.log(`API Route: Body preview length=${bodyPreview.length}, containsHtml=${hasTags}`)
      } catch (e) { /* ignore */ }

      const response = await fetch(`${backendUrl}/api/terms`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });

      // Always read response text for logging and try to parse JSON
      const responseText = await response.text().catch(() => '');
      console.log('API Route: Backend PUT response status:', response.status, 'body (truncated):', responseText.substring ? responseText.substring(0,400) : responseText);

      if (!response.ok) {
        let errorMessage = `Backend error: ${response.status}`
        try {
          const errJson = JSON.parse(responseText)
          errorMessage = errJson.message || errorMessage
        } catch (e) { /* ignore parse errors */ }

        return NextResponse.json({ success: false, message: errorMessage }, { status: response.status })
      }

      // Try parse JSON, fall back to raw text
      try {
        const data = JSON.parse(responseText)
        return NextResponse.json(data)
      } catch (e) {
        return NextResponse.json({ success: true, message: responseText })
      }
    } catch (e) {
      console.error('API Route: Error forwarding PUT to backend:', e)
      return NextResponse.json({ success: false, message: 'Failed to forward update to backend' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating terms:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}