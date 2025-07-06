import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LinearWorkspace from '@/lib/models/LinearWorkspace';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Find and update any connected workspaces
    const result = await LinearWorkspace.updateMany(
      { $or: [
        { isConnected: true },
        { integrationStatus: 'active' },
        { accessToken: { $exists: true, $ne: '' } }
      ]},
      { 
        $set: {
          isConnected: false,
          integrationStatus: 'disconnected',
          accessToken: '',
          refreshToken: '',
          tokenType: '',
          expiresIn: 0,
          scope: '',
          tokenExpiresAt: null
        }
      }
    );
    
    console.log(`Disconnected ${result.modifiedCount} Linear workspace(s)`);

    return NextResponse.json({ 
      success: true,
      disconnected: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error disconnecting Linear:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Linear integration' },
      { status: 500 }
    );
  }
} 