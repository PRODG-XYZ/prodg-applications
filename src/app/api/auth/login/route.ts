import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const { username, accessCode } = await request.json();

    if (!username || !accessCode) {
      return NextResponse.json(
        { error: 'Username and access code are required' },
        { status: 400 }
      );
    }

    const isValid = validateCredentials(username, accessCode);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create a response with authentication success
    const response = NextResponse.json({ success: true });

    // Set a session cookie
    response.cookies.set('dashboard-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 