'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { IApplication } from '@/lib/models/Application';
import { formatDate } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Settings, 
  Send, 
  Trash2, 
  BarChart3,
  Clock,
  MapPin,
  Code,
  ExternalLink,
  History,
  Calendar,
  Edit,
  Users,
  User,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileText,
  Mail,
  Github,
  Linkedin,
  X,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import ConvertToPersonnelModal from './admin/ConvertToPersonnelModal';
import { ApplicationWithMetadata } from '@/lib/types';

interface Communication {
  _id: string;
  applicationId: string;
  senderId: string;
  senderType: 'applicant' | 'admin' | 'system';
  message: string;
  timestamp: Date;
  isRead: boolean;
  messageType: string;
}

export default function Dashboard() {
  const [applications, setApplications] = useState<ApplicationWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithMetadata | null>(null);
  const [currentPage] = useState(1);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newReviewNotes, setNewReviewNotes] = useState('');
  const [newEstimatedDate, setNewEstimatedDate] = useState<Date | undefined>(undefined);
  const [messages, setMessages] = useState<Communication[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    newToday: 0,
    responseRate: 0
  });
  const [showConvertToPersonnelModal, setShowConvertToPersonnelModal] = useState(false);
  const [personnelStatus, setPersonnelStatus] = useState<{ exists: boolean; id?: string } | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        status: statusFilter === 'all' ? '' : statusFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/admin/applications?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setApplications(data.applications);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  const fetchApplicationDetails = useCallback(async (applicationId: string) => {
    try {
      const [messagesResponse, versionsResponse, personnelResponse] = await Promise.all([
        fetch(`/api/admin/applications/${applicationId}/communications`),
        fetch(`/api/admin/applications/${applicationId}/versions`),
        fetch(`/api/admin/applications/${applicationId}/personnel-status`)
      ]);

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages || []);
      }

      if (versionsResponse.ok) {
        const versionsData = await versionsResponse.json();
        setVersions(versionsData.versions || []);
      }

      if (personnelResponse.ok) {
        const personnelData = await personnelResponse.json();
        setPersonnelStatus(personnelData);
      } else {
        setPersonnelStatus({ exists: false });
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (selectedApplication) {
      fetchApplicationDetails(selectedApplication._id!);
      setNewStatus(selectedApplication.status);
      setNewReviewNotes(selectedApplication.reviewNotes || '');
      setNewEstimatedDate(selectedApplication.estimatedDecisionDate);
    }
  }, [selectedApplication, fetchApplicationDetails]);

  const updateApplicationStatus = async () => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(`/api/admin/applications/${selectedApplication._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes: newReviewNotes,
          estimatedDecisionDate: newEstimatedDate || null
        })
      });

      if (response.ok) {
        await fetchApplications();
        setSelectedApplication(prev => prev ? { ...prev, status: newStatus as any, reviewNotes: newReviewNotes } : null);
        setShowStatusModal(false);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedApplication || !newMessage.trim()) return;

    try {
      const response = await fetch(`/api/admin/applications/${selectedApplication._id}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage.trim(),
          messageType: 'message',
          senderType: 'admin'
        })
      });

      if (response.ok) {
        setNewMessage('');
        setShowMessageModal(false);
        await fetchApplicationDetails(selectedApplication._id!);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
        }
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'reviewing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(100,100,100,0.1),transparent_50%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
                Applications Dashboard
              </h1>
              <p className="text-slate-300 text-lg">
                Manage and review developer applications with enhanced monitoring
              </p>
            </div>
            
            <Link href="/dashboard/analytics">
              <Button className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/25">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total</p>
                  <p className="text-white text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending</p>
                  <p className="text-yellow-400 text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Reviewing</p>
                  <p className="text-blue-400 text-2xl font-bold">{stats.reviewing}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Approved</p>
                  <p className="text-green-400 text-2xl font-bold">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Rejected</p>
                  <p className="text-red-400 text-2xl font-bold">{stats.rejected}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">New Today</p>
                  <p className="text-cyan-400 text-2xl font-bold">{stats.newToday}</p>
                </div>
                <FileText className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Response Rate</p>
                  <p className="text-purple-400 text-2xl font-bold">{stats.responseRate}%</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Applications ({filteredApplications.length})</h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-slate-700/30 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No applications found.
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
                  {filteredApplications.map((application, index) => (
                    <motion.div
                      key={application._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedApplication(application)}
                      className={`bg-slate-700/30 rounded-lg p-4 cursor-pointer border transition-all duration-300 hover:border-gray-400/50 hover:shadow-lg hover:shadow-gray-400/10 ${
                        selectedApplication?._id === application._id ? 'border-gray-400 shadow-lg shadow-gray-400/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{application.name}</h3>
                            <p className="text-slate-400 text-sm">{application.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(application.status)}`}>
                                {application.status}
                              </Badge>
                              {application.unreadMessages && application.unreadMessages > 0 && (
                                <Badge className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5">
                                  {application.unreadMessages} new messages
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-sm">
                            {formatDate(application.createdAt)}
                          </p>
                          {application.lastLoginAt && (
                            <p className="text-slate-500 text-xs">
                              Last login: {format(new Date(application.lastLoginAt), 'MMM d')}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            {application.totalMessages && application.totalMessages > 0 && (
                              <span className="text-slate-400 text-xs flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {application.totalMessages}
                              </span>
                            )}
                            {application.versionCount && application.versionCount > 0 && (
                              <span className="text-slate-400 text-xs flex items-center gap-1">
                                <History className="w-3 h-3" />
                                {application.versionCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Enhanced Application Details */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 sticky top-8"
            >
              {selectedApplication ? (
                <div className="space-y-6">
                  {/* Header with Actions */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-400">{selectedApplication.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowMessageModal(true)}
                        className="p-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowStatusModal(true)}
                        className="p-2"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status and Review Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status:</span>
                      <Badge className={`${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status}
                      </Badge>
                    </div>
                    
                    {selectedApplication.estimatedDecisionDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Decision by:</span>
                        <span className="text-white text-sm">
                          {format(new Date(selectedApplication.estimatedDecisionDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}

                    {selectedApplication.reviewNotes && (
                      <div>
                        <span className="text-slate-400 text-sm">Review Notes:</span>
                        <p className="text-white text-sm mt-1 bg-slate-700/30 rounded p-2">
                          {selectedApplication.reviewNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Basic Contact Info */}
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${selectedApplication.email}`} className="hover:text-gray-400">
                        {selectedApplication.email}
                      </a>
                    </div>
                    {selectedApplication.phone && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{selectedApplication.phone}</span>
                      </div>
                    )}
                    {selectedApplication.country && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{selectedApplication.country}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-gray-400" />
                      <a href={selectedApplication.github} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 flex items-center gap-1">
                        GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-gray-400" />
                      <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 flex items-center gap-1">
                        LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Communication Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Messages ({messages.length})
                      </h4>
                      {messages.some(m => !m.isRead && m.senderType === 'applicant') && (
                        <Badge className="bg-red-500/20 text-red-400 text-xs">
                          Unread
                        </Badge>
                      )}
                    </div>
                    {messages.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                        {messages.slice(0, 3).map((msg) => (
                          <div key={msg._id} className="bg-slate-700/30 rounded p-2 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs ${msg.senderType === 'applicant' ? 'text-blue-400' : 'text-green-400'}`}>
                                {msg.senderType === 'applicant' ? 'Applicant' : 'Admin'}
                              </span>
                              <span className="text-xs text-slate-500">
                                {format(new Date(msg.timestamp), 'MMM d')}
                              </span>
                            </div>
                            <p className="text-slate-300 line-clamp-2">
                              {msg.message.substring(0, 80)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">No messages yet</p>
                    )}
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedApplication.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-gray-700/40 text-gray-300 text-xs rounded-md border border-gray-600/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Version History */}
                  {versions.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          <History className="w-4 h-4" />
                          Changes ({versions.length})
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowVersionHistory(!showVersionHistory)}
                          className="text-xs p-1"
                        >
                          {showVersionHistory ? 'Hide' : 'Show'}
                        </Button>
                      </div>
                      {showVersionHistory && (
                        <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                          {versions.map((version) => (
                            <div key={version._id} className="bg-slate-700/30 rounded p-2 text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-amber-400">Version {version.version}</span>
                                <span className="text-xs text-slate-500">
                                  {format(new Date(version.createdAt), 'MMM d')}
                                </span>
                              </div>
                              <p className="text-slate-300 text-xs">
                                {version.changes.length} field{version.changes.length !== 1 ? 's' : ''} updated
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Activity Summary */}
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Applied:</span>
                      <span className="text-white">{format(new Date(selectedApplication.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    {selectedApplication.lastLoginAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Active:</span>
                        <span className="text-white">{format(new Date(selectedApplication.lastLoginAt), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-slate-700 pt-4 space-y-2">
                    <Button
                      onClick={() => setShowStatusModal(true)}
                      className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                      size="sm"
                    >
                      <div className="flex items-center">
                        Update Status
                        <Settings className="w-4 h-4 ml-2" />
                      </div>
                    </Button>
                    
                    <Button
                      onClick={() => setShowMessageModal(true)}
                      className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                      size="sm"
                    >
                      <div className="flex items-center">
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </div>
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteApplication(selectedApplication._id!)}
                      className="w-full"
                    >
                      <div className="flex items-center">
                        Delete Application
                        <Trash2 className="w-4 h-4 ml-2" />
                      </div>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Select an application to view details
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Send Message to {selectedApplication.name}</h3>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                Send
              </Button>
              <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Update Application Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-slate-300 text-sm mb-2 block">Review Notes</label>
                <Textarea
                  value={newReviewNotes}
                  onChange={(e) => setNewReviewNotes(e.target.value)}
                  placeholder="Internal notes about this application..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm mb-2 block">Estimated Decision Date</label>
                <div className="flex justify-center">
                  <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50 backdrop-blur-sm">
                    <CalendarComponent
                      mode="single"
                      selected={newEstimatedDate}
                      onSelect={(date) => setNewEstimatedDate(date)}
                      initialFocus
                      className="text-white"
                      classNames={{
                        caption_label: "text-slate-100 font-medium",
                        nav_button: "text-slate-300 hover:text-white hover:bg-slate-600/50 border-slate-500",
                        head_cell: "text-slate-400 font-medium",
                        day_button: "text-slate-200 hover:text-white hover:bg-slate-600/70 transition-colors",
                        day_selected: "bg-blue-500 text-white hover:bg-blue-600 shadow-lg",
                        day_today: "bg-slate-600/70 text-white font-semibold border border-slate-500",
                        day_outside: "text-slate-500 opacity-60"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <Button 
                onClick={updateApplicationStatus}
                className="px-6 border transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: '#195248',
                  color: '#22C55E',
                  borderColor: '#0A794D'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0A794D';
                  e.currentTarget.style.color = '#4ADE80';
                  e.currentTarget.style.borderColor = '#03773A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#195248';
                  e.currentTarget.style.color = '#22C55E';
                  e.currentTarget.style.borderColor = '#0A794D';
                }}
              >
                Update
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowStatusModal(false)}
                className="border-slate-600 text-slate-500 hover:text-slate-500 hover:bg-slate-700/10 px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Personnel Modal */}
      {showConvertToPersonnelModal && selectedApplication && (
        <ConvertToPersonnelModal
          application={selectedApplication}
          isOpen={showConvertToPersonnelModal}
          onClose={() => setShowConvertToPersonnelModal(false)}
          onSuccess={() => {
            setPersonnelStatus({ exists: true });
            fetchApplications();
          }}
        />
      )}
    </div>
  );
} 