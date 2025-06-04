import { NextRequest, NextResponse } from 'next/server';
import { requireApplicantAuth } from '@/lib/applicant/auth';
import Communication from '@/lib/models/Communication';
import { connectToDatabase } from '@/lib/mongodb';
import { format } from 'date-fns';

/**
 * GET /api/applicant/communications
 * Returns all messages for the authenticated applicant's application
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

    // Fetch messages for this application
    const messages = await Communication.find({
      applicationId: authResult.session?.applicationId
    }).sort({ timestamp: -1 }); // Most recent first

    // Mark unread messages from admin/system as read when fetched
    const unreadAdminMessages = messages.filter(
      msg => !msg.isRead && msg.senderType !== 'applicant'
    );

    if (unreadAdminMessages.length > 0) {
      await Communication.updateMany(
        {
          applicationId: authResult.session?.applicationId,
          isRead: false,
          senderType: { $ne: 'applicant' }
        },
        { isRead: true }
      );
      
      // Update the messages array to reflect the read status
      unreadAdminMessages.forEach(msg => {
        msg.isRead = true;
      });
    }

    // Add helpful metadata
    const messagesWithMetadata = messages.map((msg, index) => ({
      ...msg.toObject(),
      isFirst: index === messages.length - 1,
      isLatest: index === 0,
      canReply: msg.senderType !== 'applicant',
      formattedTimestamp: format(new Date(msg.timestamp), 'MMM d, yyyy h:mm a')
    }));

    return NextResponse.json({
      messages: messagesWithMetadata,
      total: messages.length,
      hasUnread: false, // All admin messages are now marked as read
      stats: {
        totalMessages: messages.length,
        sentByApplicant: messages.filter(m => m.senderType === 'applicant').length,
        receivedFromTeam: messages.filter(m => m.senderType !== 'applicant').length
      }
    });
  } catch (error) {
    console.error('Communications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applicant/communications
 * Send a new message from the applicant
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireApplicantAuth();
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { message, messageType = 'message', attachments } = await request.json();

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create new message
    const newMessage = await Communication.create({
      applicationId: authResult.session?.applicationId,
      senderId: authResult.session?.email,
      senderType: 'applicant',
      message: message.trim(),
      messageType,
      attachments: attachments || [],
      timestamp: new Date(),
      isRead: false
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Send communication error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 