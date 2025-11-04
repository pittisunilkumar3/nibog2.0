import { NextResponse } from 'next/server';
import { GENERAL_SETTING_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const generalSettingData = await request.json();
    
    console.log("Server API route: Creating general settings:", generalSettingData);

    // Validate required fields
    if (!generalSettingData.site_name) {
      return NextResponse.json(
        { error: "Site name is required" },
        { status: 400 }
      );
    }
    
    if (!generalSettingData.site_tagline) {
      return NextResponse.json(
        { error: "Site tagline is required" },
        { status: 400 }
      );
    }
    
    if (!generalSettingData.contact_email) {
      return NextResponse.json(
        { error: "Contact email is required" },
        { status: 400 }
      );
    }
    
    if (!generalSettingData.contact_phone) {
      return NextResponse.json(
        { error: "Contact phone is required" },
        { status: 400 }
      );
    }
    
    if (!generalSettingData.address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = GENERAL_SETTING_API.CREATE;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(generalSettingData),
      cache: "no-store",
    });

    console.log(`Server API route: Create general settings response status: ${response.status}`);

    if (!response.ok) {
      // If the first attempt fails, try with a different URL format
      console.log("Server API route: First attempt failed, trying with alternative URL format");

      // Try with webhook instead of webhook-test
      const alternativeUrl = apiUrl.replace("webhook-test/v1", "webhook/v1");
      console.log("Server API route: Trying alternative URL:", alternativeUrl);

      const alternativeResponse = await fetch(alternativeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generalSettingData),
        cache: "no-store",
      });

      console.log(`Server API route: Alternative create general settings response status: ${alternativeResponse.status}`);

      if (!alternativeResponse.ok) {
        const errorText = await alternativeResponse.text();
        console.error("Server API route: Error response from alternative URL:", errorText);
        return NextResponse.json(
          { error: `Failed to create general settings. API returned status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }

      // Get the response data from the alternative URL
      const responseText = await alternativeResponse.text();
      console.log(`Server API route: Raw response from alternative URL: ${responseText}`);
      
      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(responseText);
        console.log("Server API route: Created general settings:", responseData);
        
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
    console.log(`Server API route: Raw response: ${responseText}`);
    
    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Created general settings:", responseData);
      
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
    console.error("Server API route: Error creating general settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create general settings" },
      { status: 500 }
    );
  }
}
