'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Github, 
  Linkedin,
  Edit,
  Loader,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * Application View Page
 * Displays the applicant's submitted application details
 */

interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  github: string;
  linkedin: string;
  backgroundDescription: string;
  experience: string;
  skills: string[];
  portfolioUrl?: string;
  resumeUrl?: string;
  motivation: string;
  availability: string;
  createdAt: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  lastLoginAt?: string;
  reviewNotes?: string;
}

export default function ApplicationPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch application data
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch('/api/applicant/application');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/applicant/auth/request-access');
            return;
          }
          throw new Error('Failed to fetch application');
        }

        const data = await response.json();
        setApplication(data.application);
      } catch (error) {
        console.error('Fetch application error:', error);
        setError('Failed to load application data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!application) {
    return <ErrorScreen error="Application not found" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="text-cyan-400" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-white">My Application</h1>
              <p className="text-slate-300">
                Submitted on {format(new Date(application.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          
          {/* Edit Button - only show if status is pending */}
          {application.status === 'pending' && (
            <a
              href="/applicant/application/edit"
              className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Edit size={16} />
              <span>Edit Application</span>
            </a>
          )}
        </div>

        {/* Status Badge */}
        <div className="mt-4">
          <StatusBadge status={application.status} />
        </div>
      </div>

      {/* Review Notes */}
      {application.reviewNotes && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-blue-400 font-semibold mb-3 flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>Notes from Review Team</span>
          </h3>
          <p className="text-blue-300 leading-relaxed">{application.reviewNotes}</p>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <User className="text-cyan-400" size={20} />
          <span>Personal Information</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <InfoField icon={User} label="Full Name" value={application.name} />
          <InfoField icon={Mail} label="Email" value={application.email} />
          <InfoField icon={Phone} label="Phone" value={application.phone} />
          <InfoField icon={Globe} label="Country" value={application.country} />
        </div>
      </div>

      {/* Professional Links */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-6">Professional Links</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <LinkField 
            icon={Github} 
            label="GitHub Profile" 
            value={application.github}
            href={application.github}
          />
          <LinkField 
            icon={Linkedin} 
            label="LinkedIn Profile" 
            value={application.linkedin}
            href={application.linkedin}
          />
          {application.portfolioUrl && (
            <LinkField 
              icon={ExternalLink} 
              label="Portfolio" 
              value={application.portfolioUrl}
              href={application.portfolioUrl}
            />
          )}
          {application.resumeUrl && (
            <LinkField 
              icon={FileText} 
              label="Resume" 
              value="View Resume"
              href={application.resumeUrl}
            />
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-6">Skills</h2>
        
        <div className="flex flex-wrap gap-2">
          {application.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Background & Experience */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Background</h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {application.backgroundDescription}
          </p>
        </div>
        
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Experience</h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {application.experience}
          </p>
        </div>
      </div>

      {/* Motivation & Availability */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Motivation</h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {application.motivation}
          </p>
        </div>
        
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Availability</h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {application.availability}
          </p>
        </div>
      </div>

      {/* Application Metadata */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Application Details</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Application ID</p>
            <p className="text-white font-mono text-sm">{application._id}</p>
          </div>
          
          <div>
            <p className="text-sm text-slate-400 mb-1">Status</p>
            <StatusBadge status={application.status} />
          </div>
          
          <div>
            <p className="text-sm text-slate-400 mb-1">Last Updated</p>
            <p className="text-white text-sm">
              {application.lastLoginAt 
                ? format(new Date(application.lastLoginAt), 'MMM d, yyyy h:mm a')
                : 'Never'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Info Field Component
 */
function InfoField({ icon: Icon, label, value }: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <Icon className="text-slate-400" size={16} />
        <p className="text-sm text-slate-400">{label}</p>
      </div>
      <p className="text-white">{value}</p>
    </div>
  );
}

/**
 * Link Field Component
 */
function LinkField({ icon: Icon, label, value, href }: {
  icon: any;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <Icon className="text-slate-400" size={16} />
        <p className="text-sm text-slate-400">{label}</p>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
      >
        <span>{value}</span>
        <ExternalLink size={14} />
      </a>
    </div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pending Review' },
    reviewing: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Under Review' },
    approved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Approved' },
    rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Not Selected' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}

/**
 * Loading Screen Component
 */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader className="animate-spin text-cyan-500 mx-auto mb-4" size={32} />
        <p className="text-slate-300">Loading application...</p>
      </div>
    </div>
  );
}

/**
 * Error Screen Component
 */
function ErrorScreen({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
} 