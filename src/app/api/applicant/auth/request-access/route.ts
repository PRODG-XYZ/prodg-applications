import { NextRequest, NextResponse } from 'next/server';
import { sendMagicLink } from '@/lib/applicant/auth';

/**
 * POST /api/applicant/auth/request-access
 * Sends a magic link to the applicant's email for dashboard access
 * 
 * Body: { email: string, applicationId?: string }
 * Returns: { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, applicationId } = body;

    // Basic validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Send magic link
    const success = await sendMagicLink(email, applicationId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Access link sent to your email. Please check your inbox.',
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to send access link. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request access error:', error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message === 'Application not found') {
      return NextResponse.json(
        { success: false, message: 'No application found for this email address.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 