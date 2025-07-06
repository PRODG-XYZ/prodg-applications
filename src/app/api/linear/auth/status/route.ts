import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LinearWorkspace from '@/lib/models/LinearWorkspace';
import { refreshLinearToken } from '@/lib/linear/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Look for a connected workspace using the isConnected field
    const workspace = await LinearWorkspace.findOne({ isConnected: true });
    
    if (workspace && workspace.accessToken) {
      // If we have expiresIn, calculate expiration, otherwise assume token is valid
      let isTokenValid = true;
      let expiresIn = workspace.expiresIn || 0;
      
      if (workspace.tokenExpiresAt) {
        isTokenValid = workspace.tokenExpiresAt > new Date();
        expiresIn = Math.floor((workspace.tokenExpiresAt.getTime() - Date.now()) / 1000);
      } else if (workspace.expiresIn && workspace.lastConnectedAt) {
        // Calculate if token has expired based on when it was connected
        const expirationTime = new Date(workspace.lastConnectedAt.getTime() + (workspace.expiresIn * 1000));
        isTokenValid = expirationTime > new Date();
        expiresIn = Math.floor((expirationTime.getTime() - Date.now()) / 1000);
      }
      
      // If token is expired but we have a refresh token, try to refresh
      if (!isTokenValid && workspace.refreshToken) {
        try {
          const config = {
            clientId: process.env.LINEAR_CLIENT_ID!,
            clientSecret: process.env.LINEAR_CLIENT_SECRET!,
            redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/linear/auth/callback`,
            scopes: ['read', 'write']
          };
          
          const newTokens = await refreshLinearToken(workspace.refreshToken, config);
          
          // Update the workspace with new tokens
          workspace.accessToken = newTokens.access_token;
          workspace.refreshToken = newTokens.refresh_token;
          workspace.tokenType = newTokens.token_type;
          workspace.expiresIn = newTokens.expires_in;
          workspace.scope = newTokens.scope;
          workspace.lastConnectedAt = new Date();
          
          await workspace.save();
          
          isTokenValid = true;
          expiresIn = newTokens.expires_in;
        } catch (error) {
          console.error('Failed to refresh Linear token:', error);
          // Token refresh failed, user needs to re-authenticate
        }
      }
      
      return NextResponse.json({
        isAuthenticated: isTokenValid,
        workspace: {
          id: workspace._id,
          name: workspace.name,
          isConnected: workspace.isConnected,
          lastConnectedAt: workspace.lastConnectedAt
        },
        tokens: isTokenValid ? {
          access_token: workspace.accessToken,
          token_type: workspace.tokenType || 'Bearer',
          expires_in: expiresIn,
          refresh_token: workspace.refreshToken,
          scope: workspace.scope || 'read,write'
        } : null
      });
    }
    
    return NextResponse.json({
      isAuthenticated: false,
      workspace: null,
      tokens: null
    });
  } catch (error) {
    console.error('Error checking Linear auth status:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
} 