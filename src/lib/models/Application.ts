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
});

const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application; 