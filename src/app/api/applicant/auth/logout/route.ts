import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearApplicantSession } from '@/lib/applicant/auth';

/**
 * POST /api/applicant/auth/logout
 * Clears the applicant session and removes cookie
 * 
 * Returns: { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('applicant-session')?.value;

    if (sessionToken) {
      // Clear session from database
      await clearApplicantSession(sessionToken);
    }

    // Remove session cookie
    cookieStore.delete('applicant-session');

    return NextResponse.json({
      success: true,
      message: 'Successfully logged out',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
} 