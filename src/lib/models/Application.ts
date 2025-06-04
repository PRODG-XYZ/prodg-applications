import mongoose from 'mongoose';

export interface IApplication {
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
  createdAt: Date;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  // Analytics fields
  viewCount: number;
  lastViewed: Date;
  timeToReview?: number; // in hours
  reviewerId?: string;
  // Applicant Dashboard fields
  lastLoginAt?: Date;
  communicationEnabled: boolean;
  feedbackMessage?: string;
  reviewNotes?: string; // visible to applicant
  estimatedDecisionDate?: Date;
  applicantNotifications: {
    email: boolean;
    statusUpdates: boolean;
    messages: boolean;
  };
}

const ApplicationSchema = new mongoose.Schema<IApplication>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  github: {
    type: String,
    required: true,
    trim: true,
  },
  linkedin: {
    type: String,
    required: true,
    trim: true,
  },
  backgroundDescription: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  skills: [{
    type: String,
    required: true,
  }],
  portfolioUrl: {
    type: String,
    trim: true,
  },
  resumeUrl: {
    type: String,
    trim: true,
  },
  motivation: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected'],
    default: 'pending',
  },
  // Analytics fields
  viewCount: {
    type: Number,
    default: 0,
  },
  lastViewed: {
    type: Date,
    default: Date.now,
  },
  timeToReview: {
    type: Number, // in hours
    required: false,
  },
  reviewerId: {
    type: String,
    required: false,
  },
  // Applicant Dashboard fields
  lastLoginAt: {
    type: Date,
    required: false,
  },
  communicationEnabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  feedbackMessage: {
    type: String,
    required: false,
  },
  reviewNotes: {
    type: String,
    required: false,
  },
  estimatedDecisionDate: {
    type: Date,
    required: false,
  },
  applicantNotifications: {
    email: {
      type: Boolean,
      required: true,
      default: true,
    },
    statusUpdates: {
      type: Boolean,
      required: true,
      default: true,
    },
    messages: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
});

// Add indexes for analytics queries
ApplicationSchema.index({ createdAt: -1 });
ApplicationSchema.index({ status: 1, createdAt: -1 });
ApplicationSchema.index({ country: 1 });
ApplicationSchema.index({ skills: 1 });

const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application; 