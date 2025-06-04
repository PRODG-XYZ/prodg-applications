import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyMagicLink } from '@/lib/applicant/auth';

/**
 * GET /api/applicant/auth/verify?token=<token>
 * Verifies magic link token and creates session
 * 
 * Query: { token: string }
 * Returns: Redirect to dashboard with session cookie or error page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/applicant/auth/request-access?error=missing_token', request.url)
      );
    }

    // Verify the magic link token
    const result = await verifyMagicLink(token);

    if (!result.success) {
      const errorParam = result.error === 'Token expired' ? 'expired' : 'invalid';
      return NextResponse.redirect(
        new URL(`/applicant/auth/request-access?error=${errorParam}`, request.url)
      );
    }

    // Create session cookie
    const cookieStore = await cookies();
    cookieStore.set('applicant-session', result.sessionToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Redirect to dashboard
    return NextResponse.redirect(
      new URL('/applicant/dashboard', request.url)
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.redirect(
      new URL('/applicant/auth/request-access?error=verification_failed', request.url)
    );
  }
} 