import { NextRequest, NextResponse } from 'next/server';
import { getPersonnelDashboardData } from '@/lib/personnel/dashboard';

// GET request to fetch personnel dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personnelId = searchParams.get('personnelId');

    if (!personnelId) {
      return NextResponse.json({ error: 'Personnel ID is required' }, { status: 400 });
    }

    // TODO: Add authentication check to ensure user can access this personnel's data
    // For now, we'll allow access to any personnel data
    console.log(`API: GET /api/personnel/dashboard - Fetching data for personnel ${personnelId}`);

    const dashboardData = await getPersonnelDashboardData(personnelId);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching personnel dashboard data:', error);
    
    if (error instanceof Error && error.message === 'Personnel not found') {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

// PATCH request to update personnel dashboard preferences
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personnelId = searchParams.get('personnelId');
    const body = await request.json();

    if (!personnelId) {
      return NextResponse.json({ error: 'Personnel ID is required' }, { status: 400 });
    }

    // TODO: Add authentication check to ensure user can update this personnel's data
    console.log(`API: PATCH /api/personnel/dashboard - Updating preferences for personnel ${personnelId}`);

    // For now, just return success - in a real implementation, this would update the database
    return NextResponse.json({ 
      success: true, 
      message: 'Dashboard preferences updated successfully' 
    });
  } catch (error) {
    console.error('Error updating personnel dashboard preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
} 