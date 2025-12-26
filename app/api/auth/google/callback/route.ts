import { NextResponse } from 'next/server';

// Force dynamic rendering - disable static generation and caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    console.log("Google callback endpoint called");
    
    // Parse the request body (Google credential token)
    const { credential } = await request.json();

    if (!credential) {
      console.error("No credential provided");
      return NextResponse.json(
        { error: "Google credential is required" },
        { status: 400 }
      );
    }

    console.log("Google credential received (first 50 chars):", credential.substring(0, 50) + "...");

    // Backend URL from environment variable
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL is not defined in environment variables");
      return NextResponse.json(
        { error: "Server configuration error - Backend URL not set" },
        { status: 500 }
      );
    }

    // Forward the Google credential to the backend for verification
    const apiUrl = `${backendUrl}/api/user/google-signin`;
    console.log("Calling backend API:", apiUrl);
    
    let response;
    let data;
    
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credential
        }),
        cache: "no-store",
      });

      console.log("Backend response status:", response.status);
      
      // Try to parse JSON response
      const responseText = await response.text();
      console.log("Backend response body:", responseText);
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse backend response as JSON:", parseError);
        return NextResponse.json(
          { error: "Invalid response from backend server" },
          { status: 500 }
        );
      }

    } catch (fetchError: any) {
      console.error("Failed to connect to backend:", fetchError.message);
      return NextResponse.json(
        { error: "Cannot connect to authentication server. Please ensure the backend is running." },
        { status: 503 }
      );
    }

    if (!response.ok) {
      console.error("Backend returned error:", data);
      return NextResponse.json(
        { error: data.message || data.error || "Google authentication failed" },
        { status: response.status }
      );
    }

    // Check if we have the expected data structure
    if (!data.success) {
      console.error("Backend returned success=false:", data);
      return NextResponse.json(
        { error: data.message || "Authentication was not successful" },
        { status: 400 }
      );
    }

    if (!data.user) {
      console.error("Backend response missing user data:", data);
      return NextResponse.json(
        { error: "Invalid response structure from backend" },
        { status: 500 }
      );
    }

    console.log("User authenticated successfully:", data.user.email);

    // Map backend response to frontend expected format
    const userData = {
      user_id: data.user.user_id,
      full_name: data.user.full_name,
      email: data.user.email,
      email_verified: data.user.email_verified === 1,
      phone: data.user.phone || null,
      phone_verified: false,
      city_id: data.user.city_id,
      city_name: data.user.city_name || null,
      accepted_terms: true,
      terms_accepted_at: new Date().toISOString(),
      is_active: true,
      is_locked: false,
      locked_until: null,
      deactivated_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
      auth_provider: data.user.auth_provider || 'google'
    };

    // Return the user data and token to the client with CORS headers
    const response2 = NextResponse.json({
      success: true,
      data: userData,
      token: data.token,
      message: "Google authentication successful"
    });

    // Add CORS headers
    response2.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    response2.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');

    return response2;

  } catch (error: any) {
    console.error("Unexpected error in Google OAuth callback:", error);
    console.error("Error stack:", error.stack);
    
    const errorResponse = NextResponse.json(
      { error: error.message || "Failed to authenticate with Google" },
      { status: 500 }
    );
    
    // Add CORS headers to error response too
    errorResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    errorResponse.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    return errorResponse;
  }
}
