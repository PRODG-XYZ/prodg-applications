/**
 * Application types
 */
export interface Application {
  _id?: string;
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
  reviewNotes?: string;
  estimatedDecisionDate?: string;
  communicationEnabled: boolean;
}

export interface ApplicationWithMetadata {
  _id?: string;
  name: string;
  email: string;
  position?: string;
  status: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  reviewNotes?: string;
  estimatedDecisionDate?: Date;
  resume?: string;
  phone?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
}

/**
 * Communication types
 */
export interface Communication {
  _id?: string;
  applicationId: string;
  senderId: string;
  senderType: 'applicant' | 'admin' | 'system';
  message: string;
  messageType: 'message' | 'status_update' | 'personnel_created';
  timestamp: string;
  isRead: boolean;
}

/**
 * Personnel types
 */
export interface Personnel {
  _id: string;
  applicationId: string;
  employeeId: string;
  email: string;
  name: string;
  role: 'employee' | 'senior' | 'lead' | 'manager' | 'director';
  department: string;
  startDate: string;
  manager?: string;
  directReports: string[];
  status: 'onboarding' | 'active' | 'on_leave' | 'terminated';
  profile: {
    avatar?: string;
    bio?: string;
    skills: string[];
    certifications: string[];
    socialLinks: {
      github?: string;
      linkedin?: string;
      portfolio?: string;
    };
  };
  preferences: {
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
    notifications: {
      email: boolean;
      push: boolean;
      slack: boolean;
    };
  };
  onboarding: {
    tasksCompleted: string[];
    documentsUploaded: string[];
    meetingsScheduled: string[];
    completionPercentage: number;
  };
  createdAt: string;
  lastActiveAt: string;
} 