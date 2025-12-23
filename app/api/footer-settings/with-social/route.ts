import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {

    // Get the backend URL from environment variable
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3004';
    const apiUrl = `${backendUrl}/api/footer-settings/with-social`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            company_name: "NIBOG",
            company_description: "India's biggest baby Olympic games platform, executing in 21 cities across India. NIBOG is focused exclusively on conducting baby games for children aged 5-84 months.",
            address: "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony,\nR.K Puram, Hyderabad - 500056.",
            phone: "+91-8977939614/15",
            email: "newindiababyolympics@gmail.com",
            newsletter_enabled: 1,
            copyright_text: "© {year} NIBOG. All rights reserved. India's Biggest Baby Olympic Games Platform.",
            facebook_url: "https://www.facebook.com/share/1K8H6SPtR5/",
            instagram_url: "https://www.instagram.com/nibog_100",
            linkedin_url: "https://www.linkedin.com/in/new-india-baby-olympicgames",
            youtube_url: "https://youtube.com/@newindiababyolympics"
          },
          { status: 200 }
        );
      }
      
      const errorText = await response.text();
      console.error("Server API route: Error response:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch footer settings. API returned status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error fetching footer settings:", error);
    
    // Return fallback data on error
    return NextResponse.json(
      {
        company_name: "NIBOG",
        company_description: "India's biggest baby Olympic games platform, executing in 21 cities across India. NIBOG is focused exclusively on conducting baby games for children aged 5-84 months.",
        address: "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony,\nR.K Puram, Hyderabad - 500056.",
        phone: "+91-8977939614/15",
        email: "newindiababyolympics@gmail.com",
        newsletter_enabled: 1,
        copyright_text: "© {year} NIBOG. All rights reserved. India's Biggest Baby Olympic Games Platform.",
        facebook_url: "https://www.facebook.com/share/1K8H6SPtR5/",
        instagram_url: "https://www.instagram.com/nibog_100",
        linkedin_url: "https://www.linkedin.com/in/new-india-baby-olympicgames",
        youtube_url: "https://youtube.com/@newindiababyolympics"
      },
      { status: 200 }
    );
  }
}
