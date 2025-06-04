import React from 'react';
import { IPersonnel } from '@/lib/admin/personnel';
import { 
  X, 
  User, 
  Mail, 
  Building, 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Edit,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Award,
  Briefcase,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface PersonnelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: IPersonnel | null;
  onEdit: () => void;
  onViewDashboard: () => void;
}

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
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white ${config.color}`}>
      <Icon className="w-4 h-4" />
      {config.text}
    </span>
  );
};

const OnboardingProgress = ({ personnel }: { personnel: IPersonnel }) => {
  const progress = personnel.onboarding?.completionPercentage || 0;
  const isComplete = progress >= 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-300 font-medium">Onboarding Progress</span>
        <span className="text-white font-semibold">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : progress > 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="text-sm text-slate-400">
        {isComplete ? 'Onboarding completed' : `${Math.round(100 - progress)}% remaining`}
      </div>
    </div>
  );
};

const PersonnelDetailModal = ({ 
  isOpen, 
  onClose, 
  personnel, 
  onEdit, 
  onViewDashboard 
}: PersonnelDetailModalProps) => {
  if (!isOpen || !personnel) return null;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTenure = () => {
    if (!personnel.startDate) return 'N/A';
    const start = new Date(personnel.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            {personnel.profile?.avatar && (
              <img 
                src={personnel.profile.avatar} 
                alt={personnel.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{personnel.name}</h2>
              <p className="text-slate-400">{personnel.email}</p>
              <p className="text-slate-500 text-sm">ID: {personnel.employeeId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onViewDashboard}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Department</p>
                        <p className="text-white font-medium">{personnel.department}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Role</p>
                        <p className="text-white font-medium capitalize">{personnel.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Start Date</p>
                        <p className="text-white font-medium">
                          {personnel.startDate ? formatDate(personnel.startDate) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Status</p>
                        <StatusBadge status={personnel.status} />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Tenure</p>
                        <p className="text-white font-medium">{calculateTenure()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Direct Reports</p>
                        <p className="text-white font-medium">
                          {personnel.directReports?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              {personnel.profile && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
                    Profile Information
                  </h3>
                  
                  {personnel.profile.bio && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Bio</p>
                      <p className="text-slate-300">{personnel.profile.bio}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {personnel.profile.skills && personnel.profile.skills.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-sm mb-3">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {personnel.profile.skills.map((skill, index) => (
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
                    
                    {personnel.profile.certifications && personnel.profile.certifications.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-sm mb-3">Certifications</p>
                        <div className="flex flex-wrap gap-2">
                          {personnel.profile.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm flex items-center gap-1"
                            >
                              <Award className="w-3 h-3" />
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Social Links */}
                  {personnel.profile.socialLinks && Object.keys(personnel.profile.socialLinks).length > 0 && (
                    <div>
                      <p className="text-slate-400 text-sm mb-3">Social Links</p>
                      <div className="flex gap-4">
                        {personnel.profile.socialLinks.github && (
                          <a
                            href={personnel.profile.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                          >
                            <Github className="w-4 h-4" />
                            <span className="text-slate-300">GitHub</span>
                          </a>
                        )}
                        {personnel.profile.socialLinks.linkedin && (
                          <a
                            href={personnel.profile.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                            <span className="text-slate-300">LinkedIn</span>
                          </a>
                        )}
                        {personnel.profile.socialLinks.portfolio && (
                          <a
                            href={personnel.profile.socialLinks.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            <span className="text-slate-300">Portfolio</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-8">
              {/* Onboarding Progress */}
              {personnel.status === 'onboarding' && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <OnboardingProgress personnel={personnel} />
                </div>
              )}

              {/* Working Hours & Preferences */}
              {personnel.preferences && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                    Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Timezone</p>
                      <p className="text-white">{personnel.preferences.timezone || 'Not set'}</p>
                    </div>
                    
                    {personnel.preferences.workingHours && (
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Working Hours</p>
                        <p className="text-white">
                          {personnel.preferences.workingHours.start} - {personnel.preferences.workingHours.end}
                        </p>
                      </div>
                    )}
                    
                    {personnel.preferences.notifications && (
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Notifications</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${personnel.preferences.notifications.email ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-slate-300 text-sm">Email</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${personnel.preferences.notifications.push ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-slate-300 text-sm">Push</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${personnel.preferences.notifications.slack ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-slate-300 text-sm">Slack</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                  Activity
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Created</p>
                    <p className="text-white">
                      {personnel.createdAt ? formatDate(personnel.createdAt) : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-slate-400 text-sm">Last Active</p>
                    <p className="text-white">
                      {personnel.lastActiveAt ? formatDate(personnel.lastActiveAt) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelDetailModal; 