/**
 * Linear API Authentication Module
 * 
 * This module handles authentication with the Linear API, including OAuth flow and token management.
 * 
 * ALTERNATIVE: For simpler server-side authentication, you can use Personal API Keys instead:
 * 
 * 1. Go to Linear Settings > Account > API > Personal API Keys
 * 2. Create a new API key with required permissions
 * 3. Use it directly with LinearApiClient:
 * 
 * ```typescript
 * const client = new LinearApiClient(process.env.LINEAR_API_KEY);
 * ```
 * 
 * This bypasses the OAuth flow entirely but requires storing the API key securely.
 */

export interface LinearAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface LinearTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

/**
 * Generate OAuth URL for Linear authentication
 */
export function generateLinearOAuthUrl(config: LinearAuthConfig): string {
  const scopesParam = config.scopes.join(',');
  const authUrl = new URL('https://linear.app/oauth/authorize');
  
  authUrl.searchParams.append('client_id', config.clientId);
  authUrl.searchParams.append('redirect_uri', config.redirectUri);
  authUrl.searchParams.append('scope', scopesParam);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('state', generateState());
  
  return authUrl.toString();
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  config: LinearAuthConfig
): Promise<LinearTokenResponse> {
  // Linear expects form-encoded data, not JSON
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code,
    grant_type: 'authorization_code',
  });
  
  const response = await fetch('https://api.linear.app/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }
  
  return response.json();
}

/**
 * Refresh the access token using a refresh token
 */
export async function refreshLinearToken(
  refreshToken: string,
  config: LinearAuthConfig
): Promise<LinearTokenResponse> {
  // Linear expects form-encoded data, not JSON
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  
  const response = await fetch('https://api.linear.app/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }
  
  return response.json();
}

/**
 * Generate a random state parameter for OAuth security
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Validate the state parameter returned from OAuth flow
 */
export function validateState(returnedState: string, originalState: string): boolean {
  return returnedState === originalState;
} 