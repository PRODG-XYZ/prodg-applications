import { useState, useEffect, useCallback } from 'react';
import { AnalyticsFilters, AnalyticsMetrics } from '../analytics/queries';

interface UseAnalyticsOptions {
  filters?: AnalyticsFilters;
  refreshInterval?: number; // in milliseconds, default 5 minutes
}

interface AnalyticsData {
  metrics: AnalyticsMetrics | null;
  applications: {
    trends: any[];
    statusDistribution: any[];
    geographicDistribution: any[];
  } | null;
  skills: any[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): AnalyticsData {
  const { filters = {}, refreshInterval = 300000 } = options; // 5 minutes default
  
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [applications, setApplications] = useState<AnalyticsData['applications']>(null);
  const [skills, setSkills] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQueryString = useCallback((filters: AnalyticsFilters) => {
    const params = new URLSearchParams();
    
    if (filters.startDate) {
      params.append('startDate', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate.toISOString());
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.countries && filters.countries.length > 0) {
      params.append('countries', filters.countries.join(','));
    }
    if (filters.skills && filters.skills.length > 0) {
      params.append('skills', filters.skills.join(','));
    }
    
    return params.toString();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = buildQueryString(filters);
      
      // Fetch all analytics data in parallel
      const [metricsResponse, applicationsResponse, skillsResponse] = await Promise.all([
        fetch(`/api/analytics/metrics?${queryString}`),
        fetch(`/api/analytics/applications?${queryString}`),
        fetch(`/api/analytics/skills?${queryString}`)
      ]);

      if (!metricsResponse.ok || !applicationsResponse.ok || !skillsResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [metricsData, applicationsData, skillsData] = await Promise.all([
        metricsResponse.json(),
        applicationsResponse.json(),
        skillsResponse.json()
      ]);

      setMetrics(metricsData);
      setApplications(applicationsData);
      setSkills(skillsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, buildQueryString]);

  // Initial fetch and refresh interval
  useEffect(() => {
    fetchAnalytics();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAnalytics, refreshInterval]);

  return {
    metrics,
    applications,
    skills,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

// Hook for tracking events
export function useAnalyticsTracking() {
  const trackEvent = useCallback(async (
    type: 'application_submitted' | 'application_viewed' | 'dashboard_access' | 'user_login',
    options?: {
      applicationId?: string;
      userId?: string;
      metadata?: {
        country?: string;
        userAgent?: string;
        referrer?: string;
        sessionId?: string;
      };
    }
  ) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          applicationId: options?.applicationId,
          userId: options?.userId,
          metadata: options?.metadata,
        }),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }, []);

  return { trackEvent };
} 