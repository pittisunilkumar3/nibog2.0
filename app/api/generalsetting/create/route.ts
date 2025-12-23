import { NextResponse } from 'next/server';
import { GENERAL_SETTING_API } from '@/config/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const generalSettingData = await request.json();
    
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

    // Call backend API (POST creates new record if not exists, or use PUT to update)
    const apiUrl = GENERAL_SETTING_API.CREATE;
    const forwardAuth = request.headers.get('authorization');

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(forwardAuth ? { 'Authorization': forwardAuth } : {})
      },
      body: JSON.stringify(generalSettingData),
      cache: "no-store",
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server API route: Error response from backend:", errorText);
      return NextResponse.json(
        { error: `Failed to create general settings. Backend returned status: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const responseText = await response.text();
    
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
    console.error("Server API route: Error creating general settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create general settings" },
      { status: 500 }
    );
  }
}
