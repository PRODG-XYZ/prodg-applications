import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Personnel from '@/lib/models/Personnel';

/**
 * GET /api/admin/applications/[id]/personnel-status
 * Check if an application has been converted to personnel
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const applicationId = params.id;
    
    // Check if a personnel record exists for this application
    const personnel = await Personnel.findOne({ applicationId });
    
    return NextResponse.json({
      exists: !!personnel,
      id: personnel?._id || null
    });
  } catch (error) {
    console.error('Error checking personnel status:', error);
    return NextResponse.json(
      { error: 'Failed to check personnel status' },
      { status: 500 }
    );
  }
} 