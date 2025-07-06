import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LinearWorkspace from '@/lib/models/LinearWorkspace';

// Simplified GraphQL query to fetch teams from Linear
const TEAMS_QUERY = `
  query GetTeams {
    teams {
      nodes {
        id
        name
        key
        description
        icon
        color
        members {
          nodes {
            id
            name
            displayName
            email
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get the connected Linear workspace
    const workspace = await LinearWorkspace.findOne({ isConnected: true });
    
    if (!workspace || !workspace.accessToken) {
      return NextResponse.json(
        { error: 'No Linear workspace connected' },
        { status: 401 }
      );
    }
    
    // Check if token has expired
    let isTokenValid = true;
    if (workspace.tokenExpiresAt) {
      isTokenValid = workspace.tokenExpiresAt > new Date();
    } else if (workspace.expiresIn && workspace.lastConnectedAt) {
      const expirationTime = new Date(workspace.lastConnectedAt.getTime() + (workspace.expiresIn * 1000));
      isTokenValid = expirationTime > new Date();
    }
    
    if (!isTokenValid) {
      return NextResponse.json(
        { error: 'Linear token has expired. Please reconnect.' },
        { status: 401 }
      );
    }
    
    console.log('Fetching teams from Linear API...');
    
    // Fetch teams from Linear API
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${workspace.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: TEAMS_QUERY,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Linear API error:', response.status, errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Linear authentication failed. Please reconnect your account.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: `Linear API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Linear API response:', JSON.stringify(data, null, 2));
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json(
        { error: 'Failed to fetch teams from Linear', details: data.errors },
        { status: 400 }
      );
    }
    
    // Transform the data to match our interface
    const teams = data.data.teams.nodes.map((team: any) => ({
      id: team.id,
      name: team.name,
      key: team.key,
      description: team.description || '',
      icon: team.icon,
      color: team.color,
      memberCount: team.members.nodes.length,
      members: team.members.nodes,
    }));
    
    console.log(`Successfully fetched ${teams.length} teams from Linear`);
    
    // Update the last sync time
    await LinearWorkspace.findByIdAndUpdate(workspace._id, {
      lastSyncedAt: new Date()
    });
    
    return NextResponse.json({ 
      teams,
      workspace: {
        id: workspace._id,
        name: workspace.name,
        lastSyncedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error fetching Linear teams:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching teams' },
      { status: 500 }
    );
  }
} 