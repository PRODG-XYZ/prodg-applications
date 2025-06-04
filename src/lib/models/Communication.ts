import mongoose from 'mongoose';

/**
 * Communication Interface
 * Handles messages between applicants and the recruitment team
 */
export interface ICommunication {
  _id: string;
  applicationId: string;
  senderId: string; // email or 'system' or admin ID
  senderType: 'applicant' | 'admin' | 'system';
  message: string;
  attachments?: string[];
  timestamp: Date;
  isRead: boolean;
  messageType: 'message' | 'status_update' | 'request' | 'notification';
}

/**
 * Communication Schema
 * - Two-way messaging system
 * - Support for file attachments
 * - Message categorization and read status
 * - Real-time notification support
 */
const CommunicationSchema = new mongoose.Schema<ICommunication>({
  applicationId: {
    type: String,
    required: true,
    ref: 'Application',
  },
  senderId: {
    type: String,
    required: true,
    // Can be email (for applicants), admin ID, or 'system'
  },
  senderType: {
    type: String,
    enum: ['applicant', 'admin', 'system'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  attachments: [{
    type: String,
    // URLs to uploaded files
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  messageType: {
    type: String,
    enum: ['message', 'status_update', 'request', 'notification'],
    default: 'message',
  },
});

// Indexes for efficient queries
CommunicationSchema.index({ applicationId: 1, timestamp: -1 });
CommunicationSchema.index({ applicationId: 1, isRead: 1 });
CommunicationSchema.index({ senderType: 1, timestamp: -1 });

const Communication = mongoose.models.Communication || 
  mongoose.model<ICommunication>('Communication', CommunicationSchema);

export default Communication; 