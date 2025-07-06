import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// For now, we'll store team mappings in a simple in-memory store
// In production, this should be stored in the database
let teamMappingsStore: any[] = [];

interface TeamMapping {
  departmentId: string;
  linearTeamId: string;
  linearTeamName: string;
  syncEnabled: boolean;
}

export async function GET() {
  try {
    // Return stored mappings
    return NextResponse.json({ 
      mappings: teamMappingsStore,
      count: teamMappingsStore.length 
    });
  } catch (error) {
    console.error('Error fetching team mappings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team mappings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { mappings } = body;
    
    if (!Array.isArray(mappings)) {
      return NextResponse.json(
        { error: 'Mappings must be an array' },
        { status: 400 }
      );
    }
    
    // Validate mapping structure
    const isValidMapping = (mapping: any): mapping is TeamMapping => {
      return (
        mapping &&
        typeof mapping.departmentId === 'string' &&
        typeof mapping.linearTeamId === 'string' &&
        typeof mapping.linearTeamName === 'string' &&
        typeof mapping.syncEnabled === 'boolean'
      );
    };
    
    if (!mappings.every(isValidMapping)) {
      return NextResponse.json(
        { error: 'Invalid mapping format' },
        { status: 400 }
      );
    }
    
    // Store the mappings (in production, save to database)
    teamMappingsStore = mappings;
    
    // TODO: In production, you would:
    // 1. Validate that departments exist
    // 2. Validate that Linear teams exist
    // 3. Save to a proper database table
    // 4. Set up webhooks for synchronization
    // 5. Create actual team-to-department associations
    
    console.log('Team mappings saved:', mappings);
    
    return NextResponse.json({
      success: true,
      mappings: teamMappingsStore,
      message: `Successfully saved ${mappings.length} team mappings`
    });
    
  } catch (error) {
    console.error('Error saving team mappings:', error);
    return NextResponse.json(
      { error: 'Failed to save team mappings' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear all mappings
    teamMappingsStore = [];
    
    return NextResponse.json({
      success: true,
      message: 'All team mappings cleared'
    });
    
  } catch (error) {
    console.error('Error clearing team mappings:', error);
    return NextResponse.json(
      { error: 'Failed to clear team mappings' },
      { status: 500 }
    );
  }
} 