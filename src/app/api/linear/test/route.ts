import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LinearWorkspace from '@/lib/models/LinearWorkspace';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Test database connection
    const workspaceCount = await LinearWorkspace.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Linear integration test successful',
      database: {
        connected: true,
        workspaces: workspaceCount
      },
      environment: {
        hasClientId: !!process.env.LINEAR_CLIENT_ID,
        hasClientSecret: !!process.env.LINEAR_CLIENT_SECRET,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      }
    });
  } catch (error) {
    console.error('Linear integration test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Integration test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 