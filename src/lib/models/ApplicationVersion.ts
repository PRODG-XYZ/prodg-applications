import mongoose from 'mongoose';

/**
 * ApplicationVersion Interface
 * Tracks changes made to applications for audit and history purposes
 */
export interface IApplicationVersion {
  _id: string;
  applicationId: string;
  version: number;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    changedAt: Date;
  }[];
  createdAt: Date;
}

/**
 * ApplicationVersion Schema
 * - Maintains complete history of application modifications
 * - Tracks individual field changes with timestamps
 * - Enables rollback and audit capabilities
 */
const ApplicationVersionSchema = new mongoose.Schema<IApplicationVersion>({
  applicationId: {
    type: String,
    required: true,
    ref: 'Application',
  },
  version: {
    type: Number,
    required: true,
    // Auto-increment per application
  },
  changes: [{
    field: {
      type: String,
      required: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient version queries
ApplicationVersionSchema.index({ applicationId: 1, version: -1 });
ApplicationVersionSchema.index({ applicationId: 1, createdAt: -1 });

const ApplicationVersion = mongoose.models.ApplicationVersion || 
  mongoose.model<IApplicationVersion>('ApplicationVersion', ApplicationVersionSchema);

export default ApplicationVersion; 