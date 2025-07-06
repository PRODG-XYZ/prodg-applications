import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Communication from '@/lib/models/Communication';
import Application from '@/lib/models/Application';

/**
 * GET /api/admin/applications/[id]/communications
 * Get all messages for a specific application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id: applicationId } = await params;

    // Verify application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get all messages for this application
    const messages = await Communication.find({
      applicationId
    }).sort({ timestamp: -1 });

    // Mark admin messages as read when viewed
    await Communication.updateMany(
      {
        applicationId,
        senderType: 'applicant',
        isRead: false
      },
      { isRead: true }
    );

    return NextResponse.json({
      messages,
      total: messages.length,
      unreadFromApplicant: 0 // All marked as read now
    });
  } catch (error) {
    console.error('Get communications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/applications/[id]/communications
 * Send a message to an applicant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { message, messageType = 'message', senderType = 'admin' } = await request.json();
    const { id: applicationId } = await params;

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

    // Verify application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Create new message
    const newMessage = await Communication.create({
      applicationId,
      senderId: 'admin_dashboard', // Could be enhanced to include actual admin ID
      senderType,
      message: message.trim(),
      messageType,
      timestamp: new Date(),
      isRead: false
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 