import { NextRequest, NextResponse } from 'next/server';
import { requireApplicantAuth } from '@/lib/applicant/auth';
import Application from '@/lib/models/Application';
import Communication from '@/lib/models/Communication';
import ApplicationVersion from '@/lib/models/ApplicationVersion';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * GET /api/applicant/dashboard
 * Returns comprehensive dashboard data including application info, messages, and activity
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireApplicantAuth();
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Fetch all data in parallel for better performance
    const [application, messages, versions] = await Promise.all([
      Application.findById(authResult.session?.applicationId),
      Communication.find({
        applicationId: authResult.session?.applicationId
      }).sort({ timestamp: -1 }).limit(20),
      ApplicationVersion.find({
        applicationId: authResult.session?.applicationId
      }).sort({ createdAt: -1 }).limit(5)
    ]);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Count unread messages from admins/system
    const unreadMessages = messages.filter(
      msg => !msg.isRead && msg.senderType !== 'applicant'
    ).length;

    // Build real recent activity from various sources
    const recentActivity = [];

    // Add login activity
    if (application.lastLoginAt) {
      recentActivity.push({
        type: 'login',
        message: 'You accessed your dashboard',
        timestamp: application.lastLoginAt.toISOString(),
        icon: 'user'
      });
    }

    // Add recent messages
    messages.slice(0, 3).forEach(msg => {
      if (msg.senderType === 'applicant') {
        recentActivity.push({
          type: 'message_sent',
          message: 'You sent a message to the recruitment team',
          timestamp: msg.timestamp.toISOString(),
          icon: 'send'
        });
      } else {
        recentActivity.push({
          type: 'message_received',
          message: `New message from ${msg.senderType === 'system' ? 'system' : 'recruitment team'}`,
          timestamp: msg.timestamp.toISOString(),
          icon: 'message-square'
        });
      }
    });

    // Add version changes (application edits)
    versions.forEach(version => {
      recentActivity.push({
        type: 'application_updated',
        message: `Application updated (${version.changes.length} change${version.changes.length !== 1 ? 's' : ''})`,
        timestamp: version.createdAt.toISOString(),
        icon: 'edit'
      });
    });

    // Add application submission
    recentActivity.push({
      type: 'application_submitted',
      message: 'Application submitted successfully',
      timestamp: application.createdAt.toISOString(),
      icon: 'file-text'
    });

    // Sort by timestamp and limit
    const sortedActivity = recentActivity
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);

    // Create application progress with timestamps
    const applicationProgress = getApplicationProgress(application, versions, messages);

    // Get message summary
    const messageSummary = getMessageSummary(messages);

    // Remove sensitive internal fields
    const publicApplication = {
      ...application.toObject(),
      viewCount: undefined,
      timeToReview: undefined,
      reviewerId: undefined,
    };

    return NextResponse.json({
      application: publicApplication,
      progress: applicationProgress,
      messages: messageSummary,
      recentActivity: sortedActivity,
      stats: {
        totalMessages: messages.length,
        unreadMessages,
        lastActivity: sortedActivity[0]?.timestamp || application.createdAt.toISOString(),
        daysSinceSubmission: Math.floor(
          (new Date().getTime() - new Date(application.createdAt).getTime()) / 
          (1000 * 60 * 60 * 24)
        )
      }
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}

/**
 * Generate application progress with real timeline data
 */
function getApplicationProgress(application: any, versions: any[], messages: any[]) {
  const stages = [
    {
      status: 'pending',
      label: 'Application Submitted',
      description: 'Your application has been received and is awaiting initial review.',
      completedAt: application.createdAt,
      estimatedDuration: '1-2 days'
    },
    {
      status: 'reviewing',
      label: 'Under Review',
      description: 'Our team is currently reviewing your application and qualifications.',
      completedAt: application.status === 'reviewing' || 
                   application.status === 'approved' || 
                   application.status === 'rejected' ? 
                   getStatusChangeDate(messages, 'reviewing') : null,
      estimatedDuration: '3-5 days'
    },
    {
      status: 'approved',
      label: 'Approved',
      description: 'Congratulations! Your application has been approved.',
      completedAt: application.status === 'approved' ? 
                   getStatusChangeDate(messages, 'approved') : null,
      estimatedDuration: '1-2 days'
    },
    {
      status: 'rejected',
      label: 'Not Selected',
      description: 'Thank you for your interest. We encourage you to apply for future opportunities.',
      completedAt: application.status === 'rejected' ? 
                   getStatusChangeDate(messages, 'rejected') : null,
      estimatedDuration: '1-2 days'
    },
  ];

  const currentStageIndex = stages.findIndex(stage => stage.status === application.status);

  return {
    currentStatus: application.status,
    currentStageIndex,
    stages: stages.map((stage, index) => ({
      ...stage,
      isCompleted: index <= currentStageIndex,
      isActive: index === currentStageIndex,
      isPending: index > currentStageIndex
    })),
    estimatedDecisionDate: application.estimatedDecisionDate,
    reviewNotes: application.reviewNotes
  };
}

/**
 * Get status change date from system messages
 */
function getStatusChangeDate(messages: any[], status: string) {
  const statusMessage = messages.find(msg => 
    msg.senderType === 'system' && 
    msg.messageType === 'status_update' &&
    msg.message.toLowerCase().includes(status)
  );
  return statusMessage?.timestamp || null;
}

/**
 * Generate message summary
 */
function getMessageSummary(messages: any[]) {
  const totalMessages = messages.length;
  const unreadCount = messages.filter(msg => !msg.isRead && msg.senderType !== 'applicant').length;
  const lastMessage = messages[0];

  return {
    totalCount: totalMessages,
    unreadCount,
    hasMessages: totalMessages > 0,
    lastMessage: lastMessage ? {
      id: lastMessage._id,
      senderType: lastMessage.senderType,
      preview: lastMessage.message.substring(0, 100) + (lastMessage.message.length > 100 ? '...' : ''),
      timestamp: lastMessage.timestamp,
      isRead: lastMessage.isRead
    } : null
  };
} 