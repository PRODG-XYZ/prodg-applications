import React, { useState, useMemo } from 'react';
import { usePersonnelManagement } from '@/lib/hooks/usePersonnelManagement';
import { IPersonnel } from '@/lib/admin/personnel';
import { IDepartment } from '@/lib/models/Department';
import { AdminPermissions } from '@/lib/models/Admin';
import PersonnelModal from './PersonnelModal';
import BulkActionsModal from './BulkActionsModal';
import PersonnelDetailModal from './PersonnelDetailModal';
import { 
  User, 
  Calendar, 
  Clock, 
  Users, 
  CheckSquare, 
  TrendingUp,
  Activity,
  Bell,
  Settings,
  LogOut,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Filter,
  Search,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Enhanced UI components
const Button = ({ onClick, children, disabled, className, variant = 'primary' }: { 
  onClick: () => void; 
  children: React.ReactNode; 
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2";
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white disabled:bg-slate-500",
    danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400",
    success: "bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
    >
      {children}
    </button>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-500', icon: CheckCircle, text: 'Active' },
    onboarding: { color: 'bg-yellow-500', icon: Clock, text: 'Onboarding' },
    on_leave: { color: 'bg-blue-500', icon: Calendar, text: 'On Leave' },
    terminated: { color: 'bg-red-500', icon: XCircle, text: 'Terminated' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
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

interface PersonnelFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  departments: IDepartment[];
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const PersonnelFilters = ({ 
  searchTerm, 
  onSearchChange, 
  selectedDepartment, 
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  selectedRole,
  onRoleChange,
  departments,
  onApplyFilters,
  onClearFilters
}: PersonnelFiltersProps) => (
  <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Filter className="w-5 h-5" />
        Filters
      </h3>
      <Button onClick={onClearFilters} variant="secondary" className="text-sm px-3 py-1">
        Clear All
      </Button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search personnel..." 
          value={searchTerm} 
          onChange={(e) => onSearchChange(e.target.value)} 
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
        />
      </div>
      
      <select 
        value={selectedDepartment} 
        onChange={(e) => onDepartmentChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Departments</option>
        {departments.map(dep => <option key={dep._id} value={dep.name}>{dep.name}</option>)}
      </select>
      
      <select 
        value={selectedStatus} 
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="onboarding">Onboarding</option>
        <option value="on_leave">On Leave</option>
        <option value="terminated">Terminated</option>
      </select>
      
      <select 
        value={selectedRole} 
        onChange={(e) => onRoleChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
      >
        <option value="all">All Roles</option>
        <option value="employee">Employee</option>
        <option value="senior">Senior</option>
        <option value="lead">Lead</option>
        <option value="manager">Manager</option>
        <option value="director">Director</option>
      </select>
      
      <Button onClick={onApplyFilters} variant="primary" className="w-full">
        Apply Filters
      </Button>
    </div>
  </div>
);

interface PersonnelTableProps {
  personnel: IPersonnel[];
  selectedItems: string[];
  onSelectionChange: (selected: string[]) => void;
  permissions: AdminPermissions;
  onView: (person: IPersonnel) => void;
  onEdit: (person: IPersonnel) => void;
  onDelete: (id: string) => void;
  onViewDashboard: (person: IPersonnel) => void;
  loading: boolean;
}

const PersonnelTable = ({ 
  personnel, 
  selectedItems, 
  onSelectionChange, 
  permissions, 
  onView,
  onEdit, 
  onDelete,
  onViewDashboard,
  loading 
}: PersonnelTableProps) => {
  if (loading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/4 mx-auto"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-white">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="p-4 text-left">
                <input 
                  type="checkbox" 
                  checked={personnel.length > 0 && selectedItems.length === personnel.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectionChange(personnel.map(p => p._id));
                    } else {
                      onSelectionChange([]);
                    }
                  }}
                  className="rounded"
                />
              </th>
              <th className="p-4 text-left">Personnel</th>
              <th className="p-4 text-left">Role & Department</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Onboarding</th>
              <th className="p-4 text-left">Last Active</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {personnel.map(p => (
              <tr key={p._id} className="border-t border-slate-600 hover:bg-slate-700/30 transition-colors">
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(p._id)}
                    onChange={() => {
                      const newSelection = selectedItems.includes(p._id)
                        ? selectedItems.filter(id => id !== p._id)
                        : [...selectedItems, p._id];
                      onSelectionChange(newSelection);
                    }}
                    className="rounded"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    {p.profile.avatar && (
                      <img 
                        src={p.profile.avatar} 
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-white">{p.name}</div>
                      <div className="text-sm text-slate-400">{p.email}</div>
                      <div className="text-xs text-slate-500">ID: {p.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded-full capitalize">
                      {p.role}
                    </span>
                    <div className="text-sm text-slate-300">{p.department}</div>
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge status={p.status} />
                </td>
                <td className="p-4">
                  <OnboardingProgress personnel={p} />
                </td>
                <td className="p-4 text-slate-300">
                  {p.lastActiveAt ? new Date(p.lastActiveAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onViewDashboard(p)} 
                      variant="secondary" 
                      className="text-xs px-2 py-1"
                    >
                      <Eye className="w-3 h-3" />
                      Dashboard
                    </Button>
                    {permissions.canManagePersonnel && (
                      <>
                        <Button 
                          onClick={() => onView(p)} 
                          variant="secondary" 
                          className="text-xs px-2 py-1"
                        >
                          <User className="w-3 h-3" />
                          View
                        </Button>
                        <Button 
                          onClick={() => onEdit(p)} 
                          variant="secondary" 
                          className="text-xs px-2 py-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button 
                          onClick={() => onDelete(p._id)} 
                          variant="danger" 
                          className="text-xs px-2 py-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {personnel.length === 0 && (
          <div className="text-center p-8 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No personnel found matching the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component
interface PersonnelManagementProps {
  permissions: AdminPermissions;
}

const PersonnelManagement = ({ permissions }: PersonnelManagementProps) => {
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
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);

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

  const handleApplyFilters = () => {
    const filters = {
      search: searchTerm || undefined,
      department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      role: selectedRole !== 'all' ? selectedRole : undefined,
    };
    fetchPersonnel(filters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedStatus('all');
    setSelectedRole('all');
    fetchPersonnel();
  };

  const handleBulkAction = async () => {
    if (selectedPersonnel.length === 0) return;
    setBulkActionsModalOpen(true);
  };

  const handleExecuteBulkAction = async (action: any) => {
    try {
      const response = await fetch('/api/admin/personnel/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action.type,
          personnelIds: action.data.personnelIds,
          value: action.value
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform bulk action');
      }

      const result = await response.json();
      
      // Show success message
      alert(`Bulk action completed successfully!\nSuccessful: ${result.results.successful}\nFailed: ${result.results.failed}`);
      
      // Refresh personnel list and clear selection
      await fetchPersonnel();
      setSelectedPersonnel([]);
    } catch (error) {
      console.error('Error executing bulk action:', error);
      alert(`Failed to execute bulk action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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

  const handleEditFromDetail = () => {
    if (viewingPersonnel) {
      setDetailModalOpen(false);
      setModalMode('edit');
      setEditingPersonnel(viewingPersonnel);
      setPersonnelModalOpen(true);
    }
  };

  const handleSavePersonnel = async (data: Partial<IPersonnel>) => {
    try {
      if (modalMode === 'create') {
        await createPersonnel(data);
      } else if (editingPersonnel) {
        await updatePersonnel(editingPersonnel._id, data);
      }
      
      // Refresh personnel list
      await fetchPersonnel();
    } catch (error) {
      console.error('Error saving personnel:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleDeletePersonnel = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this personnel member?')) {
      try {
        const response = await fetch(`/api/admin/personnel/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete personnel');
        }

        alert('Personnel member deactivated successfully.');
        await fetchPersonnel();
      } catch (error) {
        console.error('Error deleting personnel:', error);
        alert(`Failed to deactivate personnel member: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleViewDashboard = (person: IPersonnel) => {
    window.open(`/personnel/dashboard?personnelId=${person._id}`, '_blank');
  };

  const handleViewDashboardFromDetail = () => {
    if (viewingPersonnel) {
      window.open(`/personnel/dashboard?personnelId=${viewingPersonnel._id}`, '_blank');
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredPersonnel.length;
    const active = filteredPersonnel.filter(p => p.status === 'active').length;
    const onboarding = filteredPersonnel.filter(p => p.status === 'onboarding').length;
    const avgOnboardingProgress = filteredPersonnel.reduce((sum, p) => sum + (p.onboarding?.completionPercentage || 0), 0) / total || 0;
    
    return { total, active, onboarding, avgOnboardingProgress };
  }, [filteredPersonnel]);

  // Get selected personnel objects for bulk actions
  const selectedPersonnelObjects = useMemo(() => {
    return personnel.filter(p => selectedPersonnel.includes(p._id));
  }, [personnel, selectedPersonnel]);

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>Error loading personnel data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with summary stats */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Personnel Management</h1>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <span>Total: {summaryStats.total}</span>
            <span>Active: {summaryStats.active}</span>
            <span>Onboarding: {summaryStats.onboarding}</span>
            <span>Avg. Onboarding: {Math.round(summaryStats.avgOnboardingProgress)}%</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleBulkAction} 
            disabled={selectedPersonnel.length === 0}
            variant="secondary"
          >
            <MoreHorizontal className="w-4 h-4" />
            Bulk Actions ({selectedPersonnel.length})
          </Button>
          {permissions.canManagePersonnel && (
            <Button onClick={handleAddPersonnel} variant="primary">
              <UserPlus className="w-4 h-4" />
              Add Personnel
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <PersonnelFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        departments={departments}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Personnel Table */}
      <PersonnelTable 
        personnel={filteredPersonnel}
        selectedItems={selectedPersonnel}
        onSelectionChange={setSelectedPersonnel}
        permissions={permissions}
        onView={handleViewPersonnel}
        onEdit={handleEditPersonnel}
        onDelete={handleDeletePersonnel}
        onViewDashboard={handleViewDashboard}
        loading={loading}
      />

      {/* Modals */}
      <PersonnelModal
        isOpen={personnelModalOpen}
        onClose={() => setPersonnelModalOpen(false)}
        onSave={handleSavePersonnel}
        personnel={editingPersonnel}
        departments={departments}
        mode={modalMode}
      />

      <BulkActionsModal
        isOpen={bulkActionsModalOpen}
        onClose={() => setBulkActionsModalOpen(false)}
        onExecute={handleExecuteBulkAction}
        selectedPersonnel={selectedPersonnelObjects}
        departments={departments}
      />

      <PersonnelDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        personnel={viewingPersonnel}
        onEdit={handleEditFromDetail}
        onViewDashboard={handleViewDashboardFromDetail}
      />
    </div>
  );
};

export default PersonnelManagement; 