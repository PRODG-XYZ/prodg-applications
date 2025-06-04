import { useState, useEffect } from 'react';
import { IPersonnel, PersonnelFilters } from '@/lib/admin/personnel';
import { IDepartment } from '@/lib/models/Department';

interface UsePersonnelManagementReturn {
  personnel: IPersonnel[];
  departments: IDepartment[];
  loading: boolean;
  error: string | null;
  fetchPersonnel: (filters?: PersonnelFilters) => Promise<void>;
  fetchDepartments: () => Promise<void>;
  createPersonnel: (data: any) => Promise<void>;
  updatePersonnel: (id: string, data: any) => Promise<void>;
  deletePersonnel: (id: string) => Promise<void>;
  performBulkAction: (action: string, personnelIds: string[]) => Promise<void>;
}

export const usePersonnelManagement = (): UsePersonnelManagementReturn => {
  const [personnel, setPersonnel] = useState<IPersonnel[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonnel = async (filters?: PersonnelFilters) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.department) queryParams.append('department', filters.department);
      if (filters?.role) queryParams.append('role', filters.role);
      if (filters?.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/admin/personnel?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch personnel: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPersonnel(data.personnel || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch personnel');
      console.error('Error fetching personnel:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/departments');
      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.statusText}`);
      }
      
      const departments = await response.json();
      setDepartments(departments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPersonnel = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create personnel: ${response.statusText}`);
      }
      
      // Refresh personnel list after creation
      await fetchPersonnel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create personnel');
      console.error('Error creating personnel:', err);
      throw err; // Re-throw to allow component to handle
    } finally {
      setLoading(false);
    }
  };

  const updatePersonnel = async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/personnel/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update personnel: ${response.statusText}`);
      }
      
      // Refresh personnel list after update
      await fetchPersonnel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update personnel');
      console.error('Error updating personnel:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePersonnel = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/personnel/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete personnel: ${response.statusText}`);
      }
      
      // Refresh personnel list after deletion
      await fetchPersonnel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete personnel');
      console.error('Error deleting personnel:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const performBulkAction = async (action: string, personnelIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/personnel/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, personnelIds }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to perform bulk action: ${response.statusText}`);
      }
      
      // Refresh personnel list after bulk action
      await fetchPersonnel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk action');
      console.error('Error performing bulk action:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPersonnel();
    fetchDepartments();
  }, []);

  return {
    personnel,
    departments,
    loading,
    error,
    fetchPersonnel,
    fetchDepartments,
    createPersonnel,
    updatePersonnel,
    deletePersonnel,
    performBulkAction,
  };
}; 