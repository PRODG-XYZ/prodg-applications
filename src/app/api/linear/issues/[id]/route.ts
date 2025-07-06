import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LinearWorkspace from '@/lib/models/LinearWorkspace';
import { LinearApiClient } from '@/lib/linear/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Get active workspace with valid token
    const workspace = await LinearWorkspace.findOne({ 
      integrationStatus: 'active',
      tokenExpiresAt: { $gt: new Date() }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { error: 'No active Linear workspace found' },
        { status: 401 }
      );
    }

    // Create Linear API client
    const linearClient = new LinearApiClient(workspace.accessToken);
    
    // Fetch issue from Linear
    const issue = await linearClient.getIssue(params.id);
    
    return NextResponse.json({ issue });
  } catch (error) {
    console.error('Error fetching Linear issue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    
    await connectToDatabase();
    
    // Get active workspace with valid token
    const workspace = await LinearWorkspace.findOne({ 
      integrationStatus: 'active',
      tokenExpiresAt: { $gt: new Date() }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { error: 'No active Linear workspace found' },
        { status: 401 }
      );
    }

    // Create Linear API client
    const linearClient = new LinearApiClient(workspace.accessToken);
    
    // Update issue in Linear
    const issue = await linearClient.updateIssue(params.id, updates);
    
    return NextResponse.json({ issue });
  } catch (error) {
    console.error('Error updating Linear issue:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
} 