import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LinearWorkspace from '@/lib/models/LinearWorkspace';
import { LinearApiClient } from '@/lib/linear/client';

export async function POST(request: NextRequest) {
  try {
    const issueData = await request.json();
    
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
    
    // Create issue in Linear
    const issue = await linearClient.createIssue(issueData);
    
    return NextResponse.json({ issue });
  } catch (error) {
    console.error('Error creating Linear issue:', error);
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
} 