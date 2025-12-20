import { NextRequest, NextResponse } from 'next/server';

// Get single user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';
    const getUrl = `${BACKEND_URL}/api/user/${id}`;
    
    console.log(`[GET /api/users/${id}] Fetching user from backend: ${getUrl}`);
    
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    
    console.log(`[GET /api/users/${id}] Auth header present: ${!!authHeader}`);
    
    const response = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      cache: 'no-store',
    });

    console.log(`[GET /api/users/${id}] Backend response status: ${response.status}`);
    
    const data = await response.json();
    console.log(`[GET /api/users/${id}] Backend response data:`, data);
    
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

    console.log(`[PUT /api/users/${id}] Updating user at backend: ${updateUrl}`);

    // Parse the request body (partial update)
    const body = await request.json();
    console.log(`[PUT /api/users/${id}] Request body:`, body);

    // Get the Authorization header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    
    console.log(`[PUT /api/users/${id}] Auth header present: ${!!authHeader}`);
    
    if (!authHeader) {
      console.error(`[PUT /api/users/${id}] No authorization header found in request`);
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized - No token provided' 
      }, { status: 401 });
    }
    
    console.log(`[PUT /api/users/${id}] Forwarding request with auth header`);
    
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    console.log(`[PUT /api/users/${id}] Backend response status: ${response.status}`);
    
    // Get response body
    const responseText = await response.text();
    console.log(`[PUT /api/users/${id}] Backend response body:`, responseText);
    
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
    
    console.log(`[PUT /api/users/${id}] Update successful`);
    
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
