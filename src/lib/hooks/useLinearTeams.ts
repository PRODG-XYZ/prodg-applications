import { useState, useCallback } from 'react';
import { LinearTeam } from '../linear/client';

interface UseLinearTeamsProps {
  enabled?: boolean; // Allow disabling the hook
}

interface UseLinearTeamsReturn {
  teams: LinearTeam[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useLinearTeams({ enabled = true }: UseLinearTeamsProps = {}): UseLinearTeamsReturn {
  const [teams, setTeams] = useState<LinearTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeams = useCallback(async () => {
    if (!enabled) {
      setTeams([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // First check if we're authenticated
      const authResponse = await fetch('/api/linear/auth/status');
      if (!authResponse.ok) {
        throw new Error('Failed to check authentication status');
      }
      
      const authData = await authResponse.json();
      if (!authData.isAuthenticated) {
        throw new Error('Not authenticated with Linear. Please connect your account first.');
      }

      const response = await fetch('/api/linear/teams');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Linear authentication expired. Please reconnect your account.');
        }
        throw new Error(`Failed to fetch teams: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (err) {
      console.error('Error fetching Linear teams:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch teams'));
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
  };
} 