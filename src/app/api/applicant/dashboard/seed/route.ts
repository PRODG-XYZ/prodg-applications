import { NextRequest, NextResponse } from 'next/server';
import { requireApplicantAuth } from '@/lib/applicant/auth';
import Application from '@/lib/models/Application';
import Communication from '@/lib/models/Communication';
import ApplicationVersion from '@/lib/models/ApplicationVersion';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * POST /api/applicant/dashboard/seed
 * Development endpoint to seed dashboard with sample data for testing
 * Only works in development environment
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Seeding only available in development' },
      { status: 403 }
    );
  }

  try {
    const authResult = await requireApplicantAuth();
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const applicationId = authResult.session?.applicationId;

    // Clear existing test data
    await Promise.all([
      Communication.deleteMany({ applicationId }),
      ApplicationVersion.deleteMany({ applicationId })
    ]);

    // Create sample messages
    const sampleMessages = [
      {
        applicationId,
        senderId: 'system',
        senderType: 'system',
        message: 'Welcome! Your application has been successfully submitted and is now under review.',
        messageType: 'status_update',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRead: true
      },
      {
        applicationId,
        senderId: 'admin_001',
        senderType: 'admin',
        message: 'Thank you for your application. We have received your documents and our team will review them shortly. We typically respond within 3-5 business days.',
        messageType: 'message',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        isRead: true
      },
      {
        applicationId,
        senderId: authResult.session?.email || 'applicant',
        senderType: 'applicant',
        message: 'Thank you for the confirmation! I have a quick question about the next steps in the process. When can I expect to hear back about the technical interview?',
        messageType: 'message',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: true
      },
      {
        applicationId,
        senderId: 'admin_001',
        senderType: 'admin',
        message: 'Great question! Based on your application, we are moving forward with the next stage. Our technical team will be in touch within the next 2 business days to schedule a technical interview. Please keep an eye on your email.',
        messageType: 'message',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: false
      },
      {
        applicationId,
        senderId: 'system',
        senderType: 'system',
        message: 'Status Update: Your application status has been updated to "Under Review". Our technical team is now evaluating your qualifications.',
        messageType: 'status_update',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isRead: false
      }
    ];

    await Communication.insertMany(sampleMessages);

    // Create sample application versions
    const sampleVersions = [
      {
        applicationId,
        version: 1,
        changes: [
          {
            field: 'skills',
            oldValue: ['JavaScript', 'React'],
            newValue: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
            changedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
          }
        ],
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        applicationId,
        version: 2,
        changes: [
          {
            field: 'portfolio',
            oldValue: 'https://old-portfolio.com',
            newValue: 'https://new-portfolio.com',
            changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
          },
          {
            field: 'professionalProfiles.linkedin',
            oldValue: 'https://linkedin.com/in/oldprofile',
            newValue: 'https://linkedin.com/in/newprofile',
            changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ];

    await ApplicationVersion.insertMany(sampleVersions);

    // Update application with some additional fields
    await Application.findByIdAndUpdate(applicationId, {
      estimatedDecisionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      reviewNotes: 'Strong technical background. Portfolio shows good project diversity. Proceeding to technical interview stage.',
      communicationEnabled: true
    });

    return NextResponse.json({
      success: true,
      message: 'Dashboard seeded with sample data',
      data: {
        messagesCreated: sampleMessages.length,
        versionsCreated: sampleVersions.length,
        unreadMessages: sampleMessages.filter(m => !m.isRead && m.senderType !== 'applicant').length
      }
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Failed to seed dashboard data' },
      { status: 500 }
    );
  }
} 