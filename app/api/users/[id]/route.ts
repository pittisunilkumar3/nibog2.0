import { NextRequest, NextResponse } from 'next/server';

// Get single user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';
    const getUrl = `${BACKEND_URL}/api/user/${id}`;



    // Get the Authorization header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');



    const response = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      cache: 'no-store',
    });



    const data = await response.json();


    if (!response.ok || !data.success) {
      return NextResponse.json({
        success: false,
        message: data.message || 'User not found'
      }, { status: response.status || 404 });
    }

    return NextResponse.json(data.data, { status: 200 });
  } catch (error: any) {
    console.error(`[GET /api/users/${params.id}] Error:`, error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// Edit user (update by ID)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';
    const updateUrl = `${BACKEND_URL}/api/user/${id}`;



    // Parse the request body (partial update)
    const body = await request.json();


    // Get the Authorization header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');



    if (!authHeader) {
      console.error(`[PUT /api/users/${id}] No authorization header found in request`);
      return NextResponse.json({
        success: false,
        message: 'Unauthorized - No token provided'
      }, { status: 401 });
    }



    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });



    // Get response body
    const responseText = await response.text();


    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`[PUT /api/users/${id}] Failed to parse response as JSON:`, responseText);
      return NextResponse.json({
        success: false,
        message: 'Invalid response from backend'
      }, { status: 500 });
    }

    if (!response.ok || !data.success) {
      console.error(`[PUT /api/users/${id}] Backend returned error:`, data);
      return NextResponse.json({
        success: false,
        message: data.message || 'Failed to update user'
      }, { status: response.status || 400 });
    }



    return NextResponse.json({
      success: true,
      message: data.message || 'User updated successfully'
    }, { status: 200 });
  } catch (error: any) {
    console.error(`[PUT /api/users/${params.id}] Error:`, error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
