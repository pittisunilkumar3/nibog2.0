import { NextResponse } from 'next/server';
import { EMAIL_SETTING_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const emailSettingData = await request.json();
    
    // removed debug log

    // Validate required fields
    if (!emailSettingData.smtp_host) {
      return NextResponse.json(
        { error: "SMTP Host is required" },
        { status: 400 }
      );
    }
    
    if (!emailSettingData.smtp_port) {
      return NextResponse.json(
        { error: "SMTP Port is required" },
        { status: 400 }
      );
    }
    
    if (!emailSettingData.smtp_username) {
      return NextResponse.json(
        { error: "SMTP Username is required" },
        { status: 400 }
      );
    }
    
    if (!emailSettingData.smtp_password) {
      return NextResponse.json(
        { error: "SMTP Password is required" },
        { status: 400 }
      );
    }
    
    if (!emailSettingData.sender_name) {
      return NextResponse.json(
        { error: "Sender Name is required" },
        { status: 400 }
      );
    }
    
    if (!emailSettingData.sender_email) {
      return NextResponse.json(
        { error: "Sender Email is required" },
        { status: 400 }
      );
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = EMAIL_SETTING_API.CREATE;
    // removed debug log

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailSettingData),
      cache: "no-store",
    });

    // removed debug log

    if (!response.ok) {
      // If the first attempt fails, try with a different URL format
      // removed debug log

      // Try with webhook-test instead of webhook
      const alternativeUrl = apiUrl.replace("webhook/v1", "webhook-test/v1");
      // removed debug log

      const alternativeResponse = await fetch(alternativeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailSettingData),
        cache: "no-store",
      });

      // removed debug log

      if (!alternativeResponse.ok) {
        const errorText = await alternativeResponse.text();
        console.error("Server API route: Error response from alternative URL:", errorText);
        return NextResponse.json(
          { error: `Failed to create email settings. API returned status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }

      // Get the response data from the alternative URL
      const responseText = await alternativeResponse.text();
      // removed debug log
      
      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(responseText);
        
        return NextResponse.json(responseData, { status: 201 });
      } catch (parseError) {
        console.error("Server API route: Error parsing response:", parseError);
        // If parsing fails, return the error
        return NextResponse.json(
          { 
            error: "Failed to parse API response", 
            rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
          },
          { status: 500 }
        );
      }
    }

    // Get the response data
    const responseText = await response.text();
    // removed debug log
    
    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      
      return NextResponse.json(responseData, { status: 201 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails, return the error
      return NextResponse.json(
        { 
          error: "Failed to parse API response", 
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Server API route: Error creating email settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create email settings" },
      { status: 500 }
    );
  }
}
