import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Communication from '@/lib/models/Communication';

/**
 * PATCH /api/admin/applications/[id]/status
 * Update application status with review notes and estimated decision date
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { status, reviewNotes, estimatedDecisionDate } = await request.json();
    const applicationId = params.id;

    // Validate status
    const validStatuses = ['pending', 'reviewing', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get current application to check for status change
    const currentApplication = await Application.findById(applicationId);
    if (!currentApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const statusChanged = currentApplication.status !== status;

    // Update application
    const updateData: any = {
      status,
      reviewNotes: reviewNotes || undefined,
      estimatedDecisionDate: estimatedDecisionDate ? new Date(estimatedDecisionDate) : undefined
    };

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true, runValidators: true }
    );

    // Create system message for status change
    if (statusChanged) {
      await Communication.create({
        applicationId,
        senderId: 'system',
        senderType: 'system',
        message: `Status Update: Your application status has been updated to "${status}".${
          status === 'approved' 
            ? ' Congratulations! We will be in touch with next steps.'
            : status === 'rejected'
            ? ' Thank you for your interest. We encourage you to apply for future opportunities.'
            : status === 'reviewing'
            ? ' Our team is now reviewing your application in detail.'
            : ''
        }`,
        messageType: 'status_update',
        timestamp: new Date(),
        isRead: false
      });
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      statusChanged
    });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
} 