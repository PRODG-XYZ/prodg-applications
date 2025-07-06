import { useState, useEffect } from 'react';

export interface Department {
  _id: string;
  name: string;
  description: string;
  headCount: number;
  budget: number;
  status: 'active' | 'inactive' | 'restructuring';
  created: string;
  lastUpdated: string;
}

interface DepartmentFilters {
  search?: string;
  status?: string;
}

interface UseDepartmentManagementReturn {
  departments: Department[];
  loading: boolean;
  error: string | null;
  fetchDepartments: (filters?: DepartmentFilters) => Promise<void>;
  createDepartment: (data: Partial<Department>) => Promise<void>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
}

export const useDepartmentManagement = (): UseDepartmentManagementReturn => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, we'll use a mock implementation
  // In a real app, you would connect to actual API endpoints
  const fetchDepartments = async (filters?: DepartmentFilters) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const mockDepartments: Department[] = [
        {
          _id: '1',
          name: 'Engineering',
          description: 'Software development and technical operations',
          headCount: 24,
          budget: 1500000,
          status: 'active',
          created: new Date('2022-01-15').toISOString(),
          lastUpdated: new Date('2023-04-10').toISOString()
        },
        {
          _id: '2',
          name: 'Marketing',
          description: 'Brand management and marketing campaigns',
          headCount: 12,
          budget: 800000,
          status: 'active',
          created: new Date('2022-02-20').toISOString(),
          lastUpdated: new Date('2023-03-05').toISOString()
        },
        {
          _id: '3',
          name: 'Operations',
          description: 'Business operations and logistics',
          headCount: 8,
          budget: 500000,
          status: 'restructuring',
          created: new Date('2022-03-10').toISOString(),
          lastUpdated: new Date('2023-05-12').toISOString()
        },
        {
          _id: '4',
          name: 'Human Resources',
          description: 'Recruiting and personnel management',
          headCount: 6,
          budget: 400000,
          status: 'active',
          created: new Date('2022-04-05').toISOString(),
          lastUpdated: new Date('2023-02-15').toISOString()
        },
        {
          _id: '5',
          name: 'Finance',
          description: 'Financial planning and accounting',
          headCount: 5,
          budget: 350000,
          status: 'active',
          created: new Date('2022-05-15').toISOString(),
          lastUpdated: new Date('2023-01-20').toISOString()
        }
      ];
      
      // Apply filters if provided
      let filteredDepartments = [...mockDepartments];
      
      if (filters) {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredDepartments = filteredDepartments.filter(dept => 
            dept.name.toLowerCase().includes(searchTerm) ||
            dept.description.toLowerCase().includes(searchTerm)
          );
        }
        
        if (filters.status && filters.status !== 'all') {
          filteredDepartments = filteredDepartments.filter(dept => 
            dept.status === filters.status
          );
        }
      }
      
      setDepartments(filteredDepartments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (data: Partial<Department>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newDepartment: Department = {
        _id: Math.random().toString(36).substr(2, 9),
        name: data.name || '',
        description: data.description || '',
        headCount: data.headCount || 0,
        budget: data.budget || 0,
        status: data.status as 'active' | 'inactive' | 'restructuring' || 'active',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      setDepartments(prevDepartments => [...prevDepartments, newDepartment]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create department');
      console.error('Error creating department:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id: string, data: Partial<Department>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDepartments(prevDepartments => 
        prevDepartments.map(dept => 
          dept._id === id 
            ? { ...dept, ...data, lastUpdated: new Date().toISOString() } 
            : dept
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update department');
      console.error('Error updating department:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDepartments(prevDepartments => 
        prevDepartments.filter(dept => dept._id !== id)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department');
      console.error('Error deleting department:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
  };
}; 