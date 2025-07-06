'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Search, 
  Plus,
  Users,
  Edit,
  Trash2,
  BarChart3,
  Briefcase,
  CheckCircle,
  Clock,
  UserPlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDepartmentManagement, Department } from '@/lib/hooks/useDepartmentManagement';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Partial<Department>) => void;
  department: Department | null;
  mode: 'create' | 'edit';
}

// Simple modal component for department operations
const DepartmentModal = ({ isOpen, onClose, onSave, department, mode }: DepartmentModalProps) => {
  const [formData, setFormData] = useState<Partial<Department>>(
    department || {
      name: '',
      description: '',
      headCount: 0,
      budget: 0,
      status: 'active'
    }
  );

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-slate-800 rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {mode === 'create' ? 'Create Department' : 'Edit Department'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Department Name
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="bg-slate-700/50 border-slate-600"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Head Count
                </label>
                <Input
                  type="number"
                  name="headCount"
                  value={formData.headCount}
                  onChange={handleChange}
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Budget
                </label>
                <Input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="restructuring">Restructuring</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function DepartmentManagement() {
  const {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
  } = useDepartmentManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Filter departments based on search term and status filter
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const matchesSearch = !searchTerm || 
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, statusFilter]);

  // Calculate department stats
  const stats = {
    total: departments.length,
    active: departments.filter(d => d.status === 'active').length,
    inactive: departments.filter(d => d.status === 'inactive').length,
    restructuring: departments.filter(d => d.status === 'restructuring').length,
    totalHeadCount: departments.reduce((sum, dept) => sum + dept.headCount, 0),
    totalBudget: departments.reduce((sum, dept) => sum + dept.budget, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border"><Trash2 className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'restructuring':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border"><Clock className="w-3 h-3 mr-1" />Restructuring</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleAddDepartment = () => {
    setModalMode('create');
    setEditingDepartment(null);
    setModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setModalMode('edit');
    setEditingDepartment(department);
    setModalOpen(true);
  };

  const handleDeleteDepartment = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
        toast.success('Department deleted successfully');
      } catch (error) {
        toast.error('Failed to delete department');
        console.error(error);
      }
    }
  };

  const handleSaveDepartment = async (data: Partial<Department>) => {
    try {
      if (modalMode === 'create') {
        await createDepartment(data);
        toast.success('Department created successfully');
      } else if (editingDepartment) {
        await updateDepartment(editingDepartment._id, data);
        toast.success('Department updated successfully');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(`Failed to ${modalMode} department`);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
          <p className="text-slate-400">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Departments</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Restructuring</p>
              <p className="text-2xl font-bold text-white">{stats.restructuring}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Inactive</p>
              <p className="text-2xl font-bold text-white">{stats.inactive}</p>
            </div>
            <Trash2 className="h-8 w-8 text-red-400" />
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Staff</p>
              <p className="text-2xl font-bold text-white">{stats.totalHeadCount}</p>
            </div>
            <Users className="h-8 w-8 text-purple-400" />
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Budget</p>
              <p className="text-2xl font-bold text-white">${(stats.totalBudget / 1000000).toFixed(1)}M</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 bg-slate-700/50 border-slate-600 text-white"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-700/50 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="restructuring">Restructuring</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAddDepartment}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        </div>
      </Card>

      {/* Departments Table */}
      <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/50">
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Department</th>
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Head Count</th>
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Budget</th>
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Updated</th>
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredDepartments.map(dept => (
                <tr key={dept._id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-slate-300" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{dept.name}</div>
                        <div className="text-sm text-slate-400">{dept.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="text-white">{dept.headCount}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="text-white">${(dept.budget / 1000).toFixed(0)}k</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(dept.status)}
                  </td>
                  <td className="p-4 text-slate-300 text-sm">
                    {new Date(dept.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button 
                        onClick={() => handleEditDepartment(dept)} 
                        variant="ghost" 
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => handleDeleteDepartment(dept._id)} 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDepartments.length === 0 && (
            <div className="text-center p-8 text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No departments found matching the current filters.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Department Modal */}
      {modalOpen && (
        <DepartmentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          mode={modalMode}
          department={editingDepartment}
          onSave={handleSaveDepartment}
        />
      )}
    </div>
  );
} 