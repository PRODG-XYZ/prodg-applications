import { useState, useEffect } from 'react';
import { LinearIssue, LinearIssueInput } from '../linear/client';

interface UseLinearIssueProps {
  issueId?: string;
}

interface UseLinearIssueReturn {
  issue: LinearIssue | null;
  isLoading: boolean;
  error: Error | null;
  updateIssue: (updates: Partial<LinearIssueInput>) => Promise<LinearIssue>;
}

export function useLinearIssue({ issueId }: UseLinearIssueProps): UseLinearIssueReturn {
  const [issue, setIssue] = useState<LinearIssue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!issueId) {
      setIssue(null);
      return;
    }

    const fetchIssue = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/linear/issues/${issueId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch issue: ${response.statusText}`);
        }
        
        const data = await response.json();
        setIssue(data.issue);
      } catch (err) {
        console.error('Error fetching Linear issue:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch issue'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssue();
  }, [issueId]);

  const updateIssue = async (updates: Partial<LinearIssueInput>): Promise<LinearIssue> => {
    if (!issueId) {
      throw new Error('Cannot update issue: No issue ID provided');
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/linear/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update issue: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIssue(data.issue);
      return data.issue;
    } catch (err) {
      console.error('Error updating Linear issue:', err);
      setError(err instanceof Error ? err : new Error('Failed to update issue'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    issue,
    isLoading,
    error,
    updateIssue,
  };
}

interface UseCreateLinearIssueReturn {
  isLoading: boolean;
  error: Error | null;
  createIssue: (issueData: LinearIssueInput) => Promise<LinearIssue>;
}

export function useCreateLinearIssue(): UseCreateLinearIssueReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createIssue = async (issueData: LinearIssueInput): Promise<LinearIssue> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/linear/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create issue: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.issue;
    } catch (err) {
      console.error('Error creating Linear issue:', err);
      setError(err instanceof Error ? err : new Error('Failed to create issue'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createIssue,
  };
} 