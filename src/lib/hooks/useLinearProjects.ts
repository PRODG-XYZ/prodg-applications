import { useState, useEffect } from 'react';
import { LinearProject } from '../linear/client';

interface UseLinearProjectsProps {
  teamId?: string;
}

interface UseLinearProjectsReturn {
  projects: LinearProject[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useLinearProjects({ teamId }: UseLinearProjectsProps): UseLinearProjectsReturn {
  const [projects, setProjects] = useState<LinearProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = async () => {
    if (!teamId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/linear/teams/${teamId}/projects`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      console.error('Error fetching Linear projects:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [teamId]);

  const refetch = async () => {
    await fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    refetch,
  };
}

export function useLinearProject(projectId?: string) {
  const [project, setProject] = useState<LinearProject | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setIssues([]);
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/linear/projects/${projectId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.statusText}`);
        }
        
        const data = await response.json();
        setProject(data.project);
        setIssues(data.issues || []);
      } catch (err) {
        console.error('Error fetching Linear project:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch project'));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return {
    project,
    issues,
    loading,
    error
  };
} 