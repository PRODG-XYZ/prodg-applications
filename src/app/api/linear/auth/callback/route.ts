import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LinearWorkspace from '@/lib/models/LinearWorkspace';
import { exchangeCodeForToken } from '@/lib/linear/auth';

// Handle Linear OAuth callback (GET request from Linear)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    if (error) {
      console.error('Linear OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/management-dashboard?linear_error=${error}`);
    }
    
    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/management-dashboard?linear_error=no_code`);
    }
    
    // Exchange code for token
    const config = {
      clientId: process.env.LINEAR_CLIENT_ID!,
      clientSecret: process.env.LINEAR_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/linear/auth/callback`,
      scopes: ['read', 'write']
    };
    
    const tokens = await exchangeCodeForToken(code, config);
    
    // Connect to database and save token
    await connectToDatabase();
    
    // Save or update workspace connection
    await LinearWorkspace.findOneAndUpdate(
      { }, // For now, we'll assume one workspace per installation
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type,
        expiresIn: tokens.expires_in,
        scope: tokens.scope,
        lastConnectedAt: new Date(),
        isConnected: true
      },
      { upsert: true, new: true }
    );
    
    // Redirect to management dashboard with success flag
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/management-dashboard?linear_connected=true`);
    
  } catch (error) {
    console.error('Error handling Linear auth callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/management-dashboard?linear_error=auth_failed`);
  }
}

// Keep POST handler for backward compatibility
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 });
    }
    
    const config = {
      clientId: process.env.LINEAR_CLIENT_ID!,
      clientSecret: process.env.LINEAR_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/linear/auth/callback`,
      scopes: ['read', 'write']
    };
    
    const tokens = await exchangeCodeForToken(code, config);
    
    // Connect to database and save token
    await connectToDatabase();
    
    // Save or update workspace connection
    const workspace = await LinearWorkspace.findOneAndUpdate(
      { }, // For now, we'll assume one workspace per installation
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type,
        expiresIn: tokens.expires_in,
        scope: tokens.scope,
        lastConnectedAt: new Date(),
        isConnected: true
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error handling Linear auth callback:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
} 