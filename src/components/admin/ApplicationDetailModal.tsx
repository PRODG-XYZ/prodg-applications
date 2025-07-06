import React, { useState, useEffect } from 'react';
import { 
  X,
  User,
  Mail,
  Globe,
  Phone,
  FileText,
  Calendar,
  MessageSquare,
  ExternalLink,
  Github,
  Linkedin,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Download,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicationWithMetadata } from '@/lib/types';

interface Message {
  _id: string;
  message: string;
  senderType: 'admin' | 'applicant' | 'system';
  timestamp: string | Date;
  isRead: boolean;
}

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationWithMetadata;
  onUpdateStatus: (status: string, notes?: string) => Promise<void>;
  onSendMessage: (message: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onDownloadResume?: () => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-500', icon: Clock, text: 'Pending' },
    reviewing: { color: 'bg-blue-500', icon: Eye, text: 'Reviewing' },
    approved: { color: 'bg-green-500', icon: CheckCircle, text: 'Approved' },
    rejected: { color: 'bg-red-500', icon: XCircle, text: 'Rejected' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white ${config.color}`}>
      <Icon className="w-4 h-4" />
      {config.text}
    </span>
  );
};

const ApplicationDetailModal = ({
  isOpen,
  onClose,
  application,
  onUpdateStatus,
  onSendMessage,
  onDelete,
  onDownloadResume
}: ApplicationDetailModalProps) => {
  const [newStatus, setNewStatus] = useState(application.status);
  const [reviewNotes, setReviewNotes] = useState(application.reviewNotes || '');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (activeTab === 'communication' && application._id) {
      fetchMessages();
    }
  }, [activeTab, application._id]);

  const fetchMessages = async () => {
    if (!application._id) return;
    
    try {
      setLoadingMessages(true);
      const response = await fetch(`/api/admin/applications/${application._id}/communications`);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  if (!isOpen) return null;
  
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(newStatus, reviewNotes);
      setIsUpdating(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setIsUpdating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setIsSending(true);
      await onSendMessage(message);
      setMessage('');
      // Fetch the updated messages after sending
      await fetchMessages();
      setIsSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{application.name}</h2>
              <p className="text-slate-400">{application.email}</p>
              <p className="text-slate-500 text-sm">Applied for: {application.position || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'details' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'communication' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('communication')}
          >
            Communication
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'status' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('status')}
          >
            Update Status
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Application Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
                      Applicant Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-slate-400 text-sm">Email</p>
                            <p className="text-white font-medium">
                              <a href={`mailto:${application.email}`} className="hover:text-blue-400">
                                {application.email}
                              </a>
                            </p>
                          </div>
                        </div>
                        
                        {application.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-slate-400 text-sm">Phone</p>
                              <p className="text-white font-medium">{application.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {application.location && (
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-slate-400 text-sm">Location</p>
                              <p className="text-white font-medium">{application.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-slate-400 text-sm">Position</p>
                            <p className="text-white font-medium">{application.position || 'Not specified'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-slate-400 text-sm">Applied On</p>
                            <p className="text-white font-medium">
                              {application.createdAt ? formatDate(application.createdAt) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-slate-400 text-sm">Status</p>
                            <StatusBadge status={application.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills and Experience */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
                      Skills & Experience
                    </h3>
                    
                    {application.skills && application.skills.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {application.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {application.experience && (
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Experience</p>
                        <p className="text-white">{application.experience}</p>
                      </div>
                    )}

                    {application.education && (
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Education</p>
                        <p className="text-white">{application.education}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Links and Actions */}
                <div className="space-y-8">
                  {/* Application Status */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Application Status</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Current Status</p>
                        <StatusBadge status={application.status} />
                      </div>
                      
                      {application.reviewNotes && (
                        <div>
                          <p className="text-slate-400 text-sm mb-2">Review Notes</p>
                          <div className="bg-slate-800/70 p-2 rounded-md text-slate-300 text-sm">
                            {application.reviewNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* External Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-2">External Links</h3>
                    <div className="space-y-2">
                      {application.github && (
                        <a
                          href={application.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-md transition-colors"
                        >
                          <Github className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-200">GitHub</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                        </a>
                      )}
                      
                      {application.linkedin && (
                        <a
                          href={application.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-md transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-200">LinkedIn</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                        </a>
                      )}
                      
                      {application.portfolio && (
                        <a
                          href={application.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-md transition-colors"
                        >
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-200">Portfolio</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white mb-2">Actions</h3>
                    
                    {onDownloadResume && (
                      <Button 
                        className="w-full bg-slate-700 hover:bg-slate-600 flex items-center gap-2"
                        onClick={onDownloadResume}
                      >
                        <Download className="w-4 h-4" />
                        Download Resume
                      </Button>
                    )}
                    
                    <Button 
                      variant="destructive" 
                      className="w-full flex items-center gap-2"
                      onClick={onDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Application
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-4">
              {/* Message History - Now First */}
              <div>
                <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-3">
                  Message History
                </h3>
                
                {loadingMessages ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="w-6 h-6 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                    {messages.map((msg) => (
                      <div 
                        key={msg._id} 
                        className={`p-2 rounded-lg ${
                          msg.senderType === 'admin' 
                            ? 'bg-blue-600/20 ml-12' 
                            : msg.senderType === 'system' 
                            ? 'bg-purple-600/20' 
                            : 'bg-slate-700/50 mr-12'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-medium ${
                            msg.senderType === 'admin' 
                              ? 'text-blue-400' 
                              : msg.senderType === 'system' 
                              ? 'text-purple-400' 
                              : 'text-green-400'
                          }`}>
                            {msg.senderType === 'admin' ? 'You' : msg.senderType === 'system' ? 'System' : 'Applicant'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-white text-sm">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Send Message - Now Second */}
              <div className="pt-2">
                <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-3">
                  Send Message
                </h3>
                
                <div className="space-y-3">
                  <Textarea
                    placeholder="Type your message to the applicant here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px] bg-slate-700/50 border-slate-600 text-white resize-none"
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-3">
                Update Application Status
              </h3>
              
              {/* Current Status Card */}
              <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700">
                <h4 className="text-sm font-medium text-slate-400 mb-2">Current Status</h4>
                <div className="flex items-center gap-3">
                  <StatusBadge status={application.status} />
                  <span className="text-slate-400 text-sm">
                    {application.status === 'pending' ? 'Waiting for review' :
                     application.status === 'reviewing' ? 'Currently being reviewed' :
                     application.status === 'approved' ? 'Application has been approved' :
                     application.status === 'rejected' ? 'Application has been rejected' : ''}
                  </span>
                </div>
                
                {application.reviewNotes && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-1">Current Notes:</p>
                    <p className="text-sm text-slate-300 italic">{application.reviewNotes}</p>
                  </div>
                )}
              </div>
              
              {/* Status Options */}
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Update Status To</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['pending', 'reviewing', 'approved', 'rejected'].map((status) => {
                    const isSelected = newStatus === status;
                    const isCurrent = application.status === status;
                    
                    // Status config for icon and description
                    const statusConfig = {
                      pending: { 
                        icon: Clock, 
                        desc: 'Waiting for initial review' 
                      },
                      reviewing: { 
                        icon: Eye, 
                        desc: 'Application is being reviewed' 
                      },
                      approved: { 
                        icon: CheckCircle, 
                        desc: 'Approve this application' 
                      },
                      rejected: { 
                        icon: XCircle, 
                        desc: 'Reject this application' 
                      }
                    };
                    
                    const config = statusConfig[status as keyof typeof statusConfig];
                    const Icon = config.icon;
                    
                    return (
                      <div 
                        key={status}
                        onClick={() => setNewStatus(status)}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all
                          ${isSelected 
                            ? 'bg-slate-700/70 border-blue-500/50' 
                            : 'bg-slate-800/30 border-slate-700 hover:bg-slate-700/30'}
                          ${isCurrent ? 'ring-2 ring-slate-500/50' : ''}
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`
                            w-4 h-4 rounded-full flex items-center justify-center
                            ${isSelected ? 'bg-blue-500' : 'bg-slate-700'}
                          `}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className={`font-medium capitalize ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {status}
                          </span>
                          {isCurrent && (
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded ml-auto">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-slate-400 ml-6">
                          <Icon className="w-3.5 h-3.5 mr-1 inline" />
                          {config.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Review Notes */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-400">Review Notes</h4>
                  <span className="text-xs text-slate-500">{reviewNotes.length}/500 characters</span>
                </div>
                <Textarea
                  placeholder="Add notes about this status change (optional)..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value.slice(0, 500))}
                  className="min-h-[100px] bg-slate-700/50 border-slate-600 text-white resize-none text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">
                  These notes will be visible to the team and help provide context about your decision.
                </p>
              </div>
              
              {/* Status Change Preview */}
              {application.status !== newStatus && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Status will change from <span className="font-medium">{application.status}</span> to <span className="font-medium">{newStatus}</span></span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 ml-6">
                    {newStatus === 'approved' 
                      ? 'A notification will be sent to the applicant that their application has been approved.'
                      : newStatus === 'rejected'
                      ? 'A notification will be sent to the applicant that their application has been rejected.'
                      : newStatus === 'reviewing'
                      ? 'The applicant will be notified that their application is now under review.'
                      : 'The status will be updated in the system.'}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={newStatus === application.status || isUpdating}
                  className={`${
                    newStatus === application.status 
                      ? 'bg-slate-700 text-slate-300' 
                      : newStatus === 'approved'
                      ? 'bg-green-600 hover:bg-green-500'
                      : newStatus === 'rejected'
                      ? 'bg-red-600 hover:bg-red-500'
                      : 'bg-blue-600 hover:bg-blue-500'
                  } text-white`}
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      {newStatus === 'approved' && <CheckCircle className="w-4 h-4 mr-2" />}
                      {newStatus === 'rejected' && <XCircle className="w-4 h-4 mr-2" />}
                      {(newStatus === 'pending' || newStatus === 'reviewing') && <Clock className="w-4 h-4 mr-2" />}
                      {newStatus === application.status ? 'No Change' : `Set Status to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal; 