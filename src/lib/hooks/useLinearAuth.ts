import { useState, useCallback, useEffect, useMemo } from 'react';
import { LinearAuthConfig, LinearTokenResponse, generateLinearOAuthUrl } from '../linear/auth';

interface UseLinearAuthProps {
  config: LinearAuthConfig;
  enabled?: boolean;
}

interface UseLinearAuthReturn {
  authUrl: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  tokens: LinearTokenResponse | null;
  workspace: any | null;
  connectToLinear: () => void;
  handleAuthCallback: (code: string) => Promise<LinearTokenResponse>;
  disconnectLinear: () => Promise<void>;
  refetchAuthStatus: () => Promise<void>;
}

export function useLinearAuth({ config, enabled = true }: UseLinearAuthProps): UseLinearAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true
  const [error, setError] = useState<Error | null>(null);
  const [tokens, setTokens] = useState<LinearTokenResponse | null>(null);
  const [workspace, setWorkspace] = useState<any | null>(null);

  // Generate authUrl using useMemo for stability
  const authUrl = useMemo(() => {
    if (enabled && config && config.clientId) {
      return generateLinearOAuthUrl(config);
    }
    return '';
  }, [enabled, config]); // config should be stable from parent's useMemo

  // Check auth status (can be called manually)
  const checkAuthStatus = useCallback(async () => {
    if (!enabled || !config.clientId) {
      setIsLoading(false);
      return;
    }

    // Avoid multiple simultaneous fetches
    if (isLoading && !tokens) { // Allow refetch even if loading if tokens are present (e.g. manual refresh)
        // console.log('Auth status check already in progress or tokens present and loading');
        // return; // This might prevent necessary refreshes, be careful
    }

    try {
      setError(null);
      setIsLoading(true);
      
      const response = await fetch('/api/linear/auth/status');
      
      if (!response.ok) {
        throw new Error(`Failed to check auth status: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated || false);
      setTokens(data.tokens || null);
      setWorkspace(data.workspace || null);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Unknown error during auth status check');
      setError(fetchError);
      console.error('Linear auth status check failed:', fetchError);
      setIsAuthenticated(false);
      setTokens(null);
      setWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, config, isLoading, tokens]); // Added isLoading and tokens to deps carefully

  // Check initial auth status on mount
  useEffect(() => {
    if (enabled && config.clientId) {
      checkAuthStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [enabled, config.clientId]); // checkAuthStatus is not added here to prevent loop from its own definition changing, relying on outer deps

  // Connect to Linear
  const connectToLinear = useCallback(() => {
    if (!authUrl) {
      setError(new Error('Auth URL not generated. Check Linear client ID. '));
      return;
    }
    
    setIsLoading(true); // Indicate loading before redirect
    window.location.href = authUrl;
  }, [authUrl]);

  // Handle auth callback (typically called from a redirect page, not directly in this hook usually)
  const handleAuthCallback = useCallback(async (code: string): Promise<LinearTokenResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/linear/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to exchange code for token: ${errorText}`);
      }

      const tokenResponse = await response.json();
      setTokens(tokenResponse);
      setIsAuthenticated(true); // Assume success means authenticated
      await checkAuthStatus(); // Re-check full status to get workspace info
      return tokenResponse;
    } catch (err) {
      const callbackError = err instanceof Error ? err : new Error('Auth callback failed');
      setError(callbackError);
      setIsAuthenticated(false); // Ensure auth status is false on error
      throw callbackError;
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthStatus]);

  // Disconnect from Linear
  const disconnectLinear = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/linear/auth/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect from Linear');
      }

      setIsAuthenticated(false);
      setTokens(null);
      setWorkspace(null);
    } catch (err) {
      const disconnectError = err instanceof Error ? err : new Error('Disconnect failed');
      setError(disconnectError);
      // Do not flip isAuthenticated to true here
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    authUrl,
    isAuthenticated,
    isLoading,
    error,
    tokens,
    workspace,
    connectToLinear,
    handleAuthCallback,
    disconnectLinear,
    refetchAuthStatus: checkAuthStatus,
  };
} 