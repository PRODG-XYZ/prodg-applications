import { NextRequest, NextResponse } from 'next/server';
import { withPersonnelAuth } from '@/lib/personnel/auth';
import { getTeamMembers } from '@/lib/personnel/dashboard';

export async function GET(request: NextRequest) {
  try {
    const { session, response } = await withPersonnelAuth()(request);
    
    if (response) return response;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamMembers = await getTeamMembers(session.personnelId);
    
    // Extract unique departments
    const departments = [...new Set(teamMembers.map((member: any) => member.department))];

    return NextResponse.json({
      success: true,
      teamMembers,
      departments,
      summary: {
        totalMembers: teamMembers.length,
        departments: departments.length,
        activeMembers: teamMembers.filter((member: any) => member.status === 'active').length
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
} 