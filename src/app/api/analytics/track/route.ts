import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, TrackingEvent } from '@/lib/analytics/tracking';
import { z } from 'zod';

const trackingSchema = z.object({
  type: z.enum(['application_submitted', 'application_viewed', 'dashboard_access', 'user_login']),
  applicationId: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.object({
    country: z.string().optional(),
    userAgent: z.string().optional(),
    referrer: z.string().optional(),
    sessionId: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = trackingSchema.parse(body);
    
    // Track the event
    await trackEvent(validatedData as TrackingEvent);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 