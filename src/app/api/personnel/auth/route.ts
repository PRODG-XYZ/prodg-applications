import { NextRequest, NextResponse } from 'next/server';
import { authenticatePersonnel, createPersonnelSession, clearPersonnelSession } from '@/lib/personnel/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action === 'login') {
      const personnel = await authenticatePersonnel(email, password);
      
      if (!personnel) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const session = await createPersonnelSession(personnel);
      
      return NextResponse.json({
        success: true,
        personnel: {
          id: personnel._id,
          name: personnel.name,
          email: personnel.email,
          role: personnel.role,
          department: personnel.department
        },
        session
      });
    }

    if (action === 'logout') {
      await clearPersonnelSession();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Personnel auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 