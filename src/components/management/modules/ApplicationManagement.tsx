'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Settings, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Eye,
  FileText,
  BarChart3,
  Plus,
  RefreshCw
} from 'lucide-react';
import { ApplicationWithMetadata } from '@/lib/types';
import ApplicationDetailModal from '@/components/admin/ApplicationDetailModal';

export default function ApplicationManagement() {
  const [applications, setApplications] = useState<ApplicationWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithMetadata | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    newToday: 0,
    responseRate: 0
  });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter === 'all' ? '' : statusFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/admin/applications?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setStats(data.stats || {
          total: 0,
          pending: 0,
          reviewing: 0,
          approved: 0,
          rejected: 0,
          newToday: 0,
          responseRate: 0
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'reviewing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchApplications();
        if (selectedApplication && selectedApplication._id === id) {
          setSelectedApplication(null);
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const updateApplicationStatus = async (status: string, notes?: string) => {
    if (!selectedApplication) return;
    
    try {
      const response = await fetch(`/api/admin/applications/${selectedApplication._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          reviewNotes: notes
        }),
      });

      if (response.ok) {
        // Update the local state to reflect the change
        setSelectedApplication(prev => {
          if (!prev) return null;
          return { ...prev, status, reviewNotes: notes || prev.reviewNotes };
        });
        
        // Refresh the applications list
        fetchApplications();
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  };

  const sendMessage = async (message: string) => {
    if (!selectedApplication || !message.trim()) return;
    
    try {
      const response = await fetch(`/api/admin/applications/${selectedApplication._id}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          senderType: 'admin'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Here you might want to show a success notification
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const viewApplicationDetails = (application: ApplicationWithMetadata) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleDeleteApplication = async () => {
    if (selectedApplication) {
      await deleteApplication(selectedApplication._id!);
    }
  };

  const downloadResume = () => {
    if (selectedApplication?.resume) {
      window.open(selectedApplication.resume, '_blank');
    } else {
      console.log('No resume available for this application');
      // Could show a notification to the user here
    }
  };

  return (
    <div className="space-y-6">
      {/* Application Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50 p-3 flex flex-col">
          <span className="text-slate-400 text-xs">Total</span>
          <div className="flex items-center mt-1">
            <FileText className="h-4 w-4 mr-2 text-blue-400" />
            <span className="text-lg font-semibold text-white">{stats.total}</span>
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-3 flex flex-col">
          <span className="text-slate-400 text-xs">Pending</span>
          <div className="flex items-center mt-1">
            <Clock className="h-4 w-4 mr-2 text-yellow-400" />
            <span className="text-lg font-semibold text-white">{stats.pending}</span>
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-3 flex flex-col">
          <span className="text-slate-400 text-xs">Reviewing</span>
          <div className="flex items-center mt-1">
            <Eye className="h-4 w-4 mr-2 text-blue-400" />
            <span className="text-lg font-semibold text-white">{stats.reviewing}</span>
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-3 flex flex-col">
          <span className="text-slate-400 text-xs">Approved</span>
          <div className="flex items-center mt-1">
            <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
            <span className="text-lg font-semibold text-white">{stats.approved}</span>
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-3 flex flex-col">
          <span className="text-slate-400 text-xs">Rejected</span>
          <div className="flex items-center mt-1">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
            <span className="text-lg font-semibold text-white">{stats.rejected}</span>
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-3 flex flex-col">
          <span className="text-slate-400 text-xs">New Today</span>
          <div className="flex items-center mt-1">
            <Plus className="h-4 w-4 mr-2 text-purple-400" />
            <span className="text-lg font-semibold text-white">{stats.newToday}</span>
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 p-3 flex flex-col">
          <span className="text-slate-400 text-xs">Response Rate</span>
          <div className="flex items-center mt-1">
            <MessageSquare className="h-4 w-4 mr-2 text-blue-400" />
            <span className="text-lg font-semibold text-white">{stats.responseRate}%</span>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/50 border-slate-700 text-white">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-white" onClick={() => fetchApplications()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Applicant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin mr-2" />
                      Loading applications...
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr 
                    key={application._id}
                    className="hover:bg-slate-700/20 transition-colors cursor-pointer"
                    onClick={() => viewApplicationDetails(application)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-300" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">{application.name}</p>
                          <p className="text-xs text-slate-400">{application.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-white">{application.position || 'Unknown'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={`${getStatusColor(application.status)} border`}>
                        {application.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">
                      {new Date(application.createdAt!).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            viewApplicationDetails(application);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteApplication(application._id!);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <ApplicationDetailModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          application={selectedApplication}
          onUpdateStatus={updateApplicationStatus}
          onSendMessage={sendMessage}
          onDelete={handleDeleteApplication}
          onDownloadResume={selectedApplication.resume ? downloadResume : undefined}
        />
      )}
    </div>
  );
} 