import { Department } from '@/lib/hooks/useDepartmentManagement';

export interface DepartmentFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'restructuring' | 'all';
}

export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  restructuring: number;
  averageHeadCount: number;
  totalBudget: number;
}

export type DepartmentAction = 
  | { type: 'create'; data: Partial<Department> }
  | { type: 'update'; id: string; data: Partial<Department> }
  | { type: 'delete'; id: string }
  | { type: 'bulk-update'; ids: string[]; data: Partial<Department> };

// Helper functions for department management
export const calculateDepartmentStats = (departments: Department[]): DepartmentStats => {
  const total = departments.length;
  const active = departments.filter(d => d.status === 'active').length;
  const inactive = departments.filter(d => d.status === 'inactive').length;
  const restructuring = departments.filter(d => d.status === 'restructuring').length;
  const totalHeadCount = departments.reduce((sum, dept) => sum + dept.headCount, 0);
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
  
  return {
    total,
    active,
    inactive,
    restructuring,
    averageHeadCount: total > 0 ? Math.round(totalHeadCount / total) : 0,
    totalBudget
  };
};

export const filterDepartments = (
  departments: Department[],
  filters: DepartmentFilters
): Department[] => {
  let result = [...departments];
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    result = result.filter(dept => 
      dept.name.toLowerCase().includes(searchTerm) ||
      dept.description.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.status && filters.status !== 'all') {
    result = result.filter(dept => dept.status === filters.status);
  }
  
  return result;
};

export const sortDepartments = (
  departments: Department[],
  sortBy: keyof Department,
  sortOrder: 'asc' | 'desc' = 'asc'
): Department[] => {
  return [...departments].sort((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortOrder === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    }
    
    // Handle dates
    if (sortBy === 'created' || sortBy === 'lastUpdated') {
      const dateA = new Date(valueA as string).getTime();
      const dateB = new Date(valueB as string).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    return 0;
  });
}; 