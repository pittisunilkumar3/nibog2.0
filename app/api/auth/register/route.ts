import { NextResponse } from 'next/server';
import { USER_AUTH_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const userData = await request.json();
    
    console.log("Server API route: Registering user:", userData);

    // Validate required fields
    if (!userData.full_name) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }
    
    if (!userData.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    if (!userData.phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }
    
    if (!userData.password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }
    
    // Make city_id optional by setting it to null if not provided
    if (!userData.city_id) {
      userData.city_id = null;
    }
    
    if (userData.accept_terms !== true) {
      return NextResponse.json(
        { error: "You must accept the terms and conditions" },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const apiUrl = USER_AUTH_API.REGISTER;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      cache: "no-store",
    });

    console.log(`Server API route: Register user response status: ${response.status}`);

    // Handle API response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      
      return NextResponse.json(
        { error: `Registration failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Parse and return the successful response
    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error("Server API route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
