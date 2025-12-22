import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

// In-memory storage for slot statuses (in production, this should be a database)
// This is a temporary solution until we have a proper database setup
let slotStatuses: Record<string, string> = {};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get('slotId');
    
    if (slotId) {
      // Get status for specific slot
      const status = slotStatuses[slotId] || 'active';
      return NextResponse.json({ slotId, status });
    } else {
      // Get all statuses
      return NextResponse.json(slotStatuses);
    }
  } catch (error: any) {
    console.error("Error getting slot status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get slot status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { slotId, status } = data;
    
    console.log(`Setting slot ${slotId} status to: ${status}`);
    
    if (!slotId) {
      return NextResponse.json(
        { error: "Slot ID is required" },
        { status: 400 }
      );
    }
    
    if (!status || !['active', 'paused', 'cancelled', 'completed', 'full'].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required (active, paused, cancelled, completed, full)" },
        { status: 400 }
      );
    }
    
    // Store the status
    if (status === 'active') {
      // Remove from storage if setting to default status
      delete slotStatuses[slotId];
    } else {
      slotStatuses[slotId] = status;
    }
    
    console.log(`Slot ${slotId} status updated to: ${status}`);
    console.log('Current slot statuses:', slotStatuses);
    
    return NextResponse.json({ 
      success: true, 
      slotId, 
      status,
      message: `Slot status updated to ${status}` 
    });
  } catch (error: any) {
    console.error("Error updating slot status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update slot status" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get('slotId');
    
    if (!slotId) {
      return NextResponse.json(
        { error: "Slot ID is required" },
        { status: 400 }
      );
    }
    
    // Remove status (revert to default 'active')
    delete slotStatuses[slotId];
    
    console.log(`Slot ${slotId} status reset to default (active)`);
    
    return NextResponse.json({ 
      success: true, 
      slotId, 
      status: 'active',
      message: "Slot status reset to active" 
    });
  } catch (error: any) {
    console.error("Error resetting slot status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset slot status" },
      { status: 500 }
    );
  }
}
