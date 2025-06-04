import mongoose from 'mongoose';

/**
 * ApplicantSession Interface
 * Manages secure sessions for applicant dashboard access
 */
export interface IApplicantSession {
  _id: string;
  email: string;
  applicationId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
}

/**
 * ApplicantSession Schema
 * - Secure token-based sessions with 7-day expiration
 * - Automatic cleanup of expired sessions
 * - Email-application pairing for access control
 */
const ApplicantSessionSchema = new mongoose.Schema<IApplicantSession>({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  applicationId: {
    type: String,
    required: true,
    ref: 'Application',
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // 7 days from creation
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance and security
ApplicantSessionSchema.index({ token: 1 }, { unique: true });
ApplicantSessionSchema.index({ email: 1 });
ApplicantSessionSchema.index({ applicationId: 1 });
// Automatic cleanup of expired sessions
ApplicantSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ApplicantSession = mongoose.models.ApplicantSession || 
  mongoose.model<IApplicantSession>('ApplicantSession', ApplicantSessionSchema);

export default ApplicantSession; 