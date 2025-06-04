import mongoose, { Schema, Document } from 'mongoose';

export interface IPersonnel extends Document {
  _id: string;
  applicationId: string; // Reference to original application
  employeeId: string; // Unique employee identifier
  email: string;
  name: string;
  role: 'employee' | 'senior' | 'lead' | 'manager' | 'director';
  department: string;
  startDate: Date;
  manager?: string; // Personnel ID of manager
  directReports: string[]; // Array of Personnel IDs
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
  createdAt: Date;
  lastActiveAt: Date;
}

const PersonnelSchema = new Schema<IPersonnel>({
  applicationId: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['employee', 'senior', 'lead', 'manager', 'director'],
    required: true 
  },
  department: { type: String, required: true },
  startDate: { type: Date, required: true },
  manager: { type: String },
  directReports: [{ type: String }],
  status: { 
    type: String, 
    enum: ['onboarding', 'active', 'on_leave', 'terminated'],
    default: 'onboarding'
  },
  profile: {
    avatar: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    certifications: [{ type: String }],
    socialLinks: {
      github: { type: String },
      linkedin: { type: String },
      portfolio: { type: String }
    }
  },
  preferences: {
    timezone: { type: String, default: 'America/New_York' },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      slack: { type: Boolean, default: false }
    }
  },
  onboarding: {
    tasksCompleted: [{ type: String }],
    documentsUploaded: [{ type: String }],
    meetingsScheduled: [{ type: String }],
    completionPercentage: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now }
});

// Indexes for performance
PersonnelSchema.index({ email: 1 });
PersonnelSchema.index({ department: 1, status: 1 });
PersonnelSchema.index({ employeeId: 1 });

export default mongoose.models.Personnel || mongoose.model<IPersonnel>('Personnel', PersonnelSchema); 