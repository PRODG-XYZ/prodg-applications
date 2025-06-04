import Analytics, { IAnalytics } from '../models/Analytics';
import { connectToDatabase } from '../mongodb';

export interface TrackingEvent {
  type: 'application_submitted' | 'application_viewed' | 'dashboard_access' | 'user_login';
  applicationId?: string;
  userId?: string;
  metadata?: {
    country?: string;
    userAgent?: string;
    referrer?: string;
    sessionId?: string;
  };
}

export async function trackEvent(event: TrackingEvent): Promise<void> {
  try {
    await connectToDatabase();
    
    const analyticsEvent = new Analytics({
      type: event.type,
      applicationId: event.applicationId,
      userId: event.userId,
      metadata: event.metadata,
      timestamp: new Date(),
    });

    await analyticsEvent.save();
  } catch (error) {
    console.error('Error tracking event:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

export async function trackApplicationSubmission(applicationId: string, metadata?: TrackingEvent['metadata']): Promise<void> {
  return trackEvent({
    type: 'application_submitted',
    applicationId,
    metadata,
  });
}

export async function trackApplicationView(applicationId: string, userId?: string, metadata?: TrackingEvent['metadata']): Promise<void> {
  return trackEvent({
    type: 'application_viewed',
    applicationId,
    userId,
    metadata,
  });
}

export async function trackDashboardAccess(userId?: string, metadata?: TrackingEvent['metadata']): Promise<void> {
  return trackEvent({
    type: 'dashboard_access',
    userId,
    metadata,
  });
}

export async function trackUserLogin(userId: string, metadata?: TrackingEvent['metadata']): Promise<void> {
  return trackEvent({
    type: 'user_login',
    userId,
    metadata,
  });
} 