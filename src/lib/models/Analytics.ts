import mongoose from 'mongoose';

export interface IAnalytics {
  _id: string;
  type: 'application_submitted' | 'application_viewed' | 'dashboard_access' | 'user_login';
  timestamp: Date;
  applicationId?: string;
  userId?: string;
  metadata?: {
    country?: string;
    userAgent?: string;
    referrer?: string;
    sessionId?: string;
  };
}

const AnalyticsSchema = new mongoose.Schema<IAnalytics>({
  type: {
    type: String,
    required: true,
    enum: ['application_submitted', 'application_viewed', 'dashboard_access', 'user_login'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true, // Index for efficient time-based queries
  },
  applicationId: {
    type: String,
    required: false,
  },
  userId: {
    type: String,
    required: false,
  },
  metadata: {
    country: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    referrer: {
      type: String,
      required: false,
    },
    sessionId: {
      type: String,
      required: false,
    },
  },
});

// Compound indexes for efficient analytics queries
AnalyticsSchema.index({ type: 1, timestamp: -1 });
AnalyticsSchema.index({ applicationId: 1, timestamp: -1 });

const Analytics = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics; 