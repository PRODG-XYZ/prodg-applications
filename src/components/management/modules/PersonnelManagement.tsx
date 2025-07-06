'use client';

import React, { useState, useMemo } from 'react';
import { usePersonnelManagement } from '@/lib/hooks/usePersonnelManagement';
import { IPersonnel } from '@/lib/admin/personnel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-react';
import PersonnelModal from '@/components/admin/PersonnelModal';
import BulkActionsModal from '@/components/admin/BulkActionsModal';
import PersonnelDetailModal from '@/components/admin/PersonnelDetailModal';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, text: 'Active' },
    onboarding: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, text: 'Onboarding' },
    on_leave: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Calendar, text: 'On Leave' },
    terminated: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, text: 'Terminated' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.color} border`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
};

const OnboardingProgress = ({ personnel }: { personnel: IPersonnel }) => {
  const progress = personnel.onboarding?.completionPercentage || 0;
  const isComplete = progress >= 100;
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-slate-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : progress > 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
    </div>
  );
};

export default function PersonnelManagement() {
  const {
    personnel,
    departments,
    loading,
    error,
    fetchPersonnel,
    createPersonnel,
    updatePersonnel,
    deletePersonnel,
    performBulkAction
  } = usePersonnelManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Modal states
  const [personnelModalOpen, setPersonnelModalOpen] = useState(false);
  const [bulkActionsModalOpen, setBulkActionsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingPersonnel, setEditingPersonnel] = useState<IPersonnel | null>(null);
  const [viewingPersonnel, setViewingPersonnel] = useState<IPersonnel | null>(null);

  // Filter personnel based on current filters
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(person => {
      const matchesSearch = !searchTerm || 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || person.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || person.status === selectedStatus;
      const matchesRole = selectedRole === 'all' || person.role === selectedRole;
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesRole;
    });
  }, [personnel, searchTerm, selectedDepartment, selectedStatus, selectedRole]);

  const handleAddPersonnel = () => {
    setModalMode('create');
    setEditingPersonnel(null);
    setPersonnelModalOpen(true);
  };

  const handleViewPersonnel = (person: IPersonnel) => {
    setViewingPersonnel(person);
    setDetailModalOpen(true);
  };

  const handleEditPersonnel = (person: IPersonnel) => {
    setModalMode('edit');
    setEditingPersonnel(person);
    setPersonnelModalOpen(true);
  };

  const handleDeletePersonnel = async (id: string) => {
    try {
      await deletePersonnel(id);
      toast.success('Personnel deleted successfully');
    } catch (error) {
      toast.error('Failed to delete personnel');
      console.error(error);
    }
  };

  const handleSavePersonnel = async (data: Partial<IPersonnel>) => {
    try {
      if (modalMode === 'create') {
        await createPersonnel(data as IPersonnel);
        toast.success('Personnel created successfully');
      } else {
        await updatePersonnel(data);
        toast.success('Personnel updated successfully');
      }
      setPersonnelModalOpen(false);
    } catch (error) {
      toast.error(`Failed to ${modalMode} personnel`);
      console.error(error);
    }
  };

  const handleBulkAction = async () => {
    if (selectedPersonnel.length === 0) return;
    setBulkActionsModalOpen(true);
  };

  const handleExecuteBulkAction = async (action: any) => {
    try {
      await performBulkAction(action.type, action.data.personnelIds);
      setSelectedPersonnel([]);
      setBulkActionsModalOpen(false);
    } catch (error) {
      console.error('Error executing bulk action:', error);
    }
  };

  const handleViewDashboard = (person: IPersonnel) => {
    // Navigate to the personnel dashboard
    window.location.href = `/dashboard/personnel/${person._id}`;
  };

  // Stats calculation
  const stats = {
    total: personnel.length,
    active: personnel.filter(p => p.status === 'active').length,
    onboarding: personnel.filter(p => p.status === 'onboarding').length,
    onLeave: personnel.filter(p => p.status === 'on_leave').length,
    departments: [...new Set(personnel.map(p => p.department))].length
  };

  if (loading && personnel.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
          <p className="text-slate-400">Loading personnel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Personnel</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
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
              <p className="text-slate-400 text-sm">Onboarding</p>
              <p className="text-2xl font-bold text-white">{stats.onboarding}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">On Leave</p>
              <p className="text-2xl font-bold text-white">{stats.onLeave}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Departments</p>
              <p className="text-2xl font-bold text-white">{stats.departments}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 bg-slate-700/50 border-slate-600 text-white"
                placeholder="Search personnel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-700/50 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map(dep => (
                <option key={dep._id} value={dep.name}>{dep.name}</option>
              ))}
            </select>
            
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-700/50 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
            
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-700/50 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="employee">Employee</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAddPersonnel}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Personnel
            </Button>
          </div>
        </div>
      </Card>

      {/* Personnel Table */}
      <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/50">
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Personnel</th>
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role & Department</th>
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Onboarding</th>
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Active</th>
                <th className="p-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredPersonnel.map(person => (
                <tr key={person._id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <Users className="h-5 w-5 text-slate-300" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{person.name}</div>
                        <div className="text-sm text-slate-400">{person.email}</div>
                        <div className="text-xs text-slate-500">ID: {person.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 border">
                        {person.role}
                      </Badge>
                      <div className="text-sm text-slate-300">{person.department}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={person.status} />
                  </td>
                  <td className="p-4">
                    <OnboardingProgress personnel={person} />
                  </td>
                  <td className="p-4 text-slate-300 text-sm">
                    {person.lastActiveAt ? new Date(person.lastActiveAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button 
                        onClick={() => handleViewDashboard(person)} 
                        variant="ghost" 
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => handleViewPersonnel(person)} 
                        variant="ghost" 
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => handleEditPersonnel(person)} 
                        variant="ghost" 
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => handleDeletePersonnel(person._id)} 
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
          
          {filteredPersonnel.length === 0 && (
            <div className="text-center p-8 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No personnel found matching the current filters.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      {personnelModalOpen && (
        <PersonnelModal
          isOpen={personnelModalOpen}
          onClose={() => setPersonnelModalOpen(false)}
          mode={modalMode}
          personnel={editingPersonnel}
          onSave={handleSavePersonnel}
          departments={departments}
        />
      )}

      {bulkActionsModalOpen && (
        <BulkActionsModal
          isOpen={bulkActionsModalOpen}
          onClose={() => setBulkActionsModalOpen(false)}
          selectedPersonnel={[]}
          departments={departments}
          onExecute={() => {}}
        />
      )}

      {detailModalOpen && viewingPersonnel && (
        <PersonnelDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          personnel={viewingPersonnel}
          onEdit={() => {
            setDetailModalOpen(false);
            handleEditPersonnel(viewingPersonnel);
          }}
          onViewDashboard={() => handleViewDashboard(viewingPersonnel)}
        />
      )}
    </div>
  );
} 