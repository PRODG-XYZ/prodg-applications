import { NextRequest, NextResponse } from 'next/server';
import { ApplicantEmailService } from '@/lib/emails/applicant-email-service';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/lib/models/Application';

// Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get application ID from params
    const { id } = params;
    
    // Get status update data from request
    const { status, message } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Find and update application
    const application = await Application.findByIdAndUpdate(
      id,
      { status, ...(message && { feedbackMessage: message }) },
      { new: true }
    );
    
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Send email notification about status update
    if (application.email) {
      await ApplicantEmailService.sendStatusUpdateEmail(
        {
          id: application._id.toString(),
          name: application.name,
          email: application.email,
          status: application.status
        },
        status,
        message
      );
    }
    
    return NextResponse.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}

// Get application status
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get application ID from params
    const { id } = params;
    
    // Find application
    const application = await Application.findById(id).select('status feedbackMessage');
    
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        status: application.status,
        feedbackMessage: application.feedbackMessage
      }
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application status' },
      { status: 500 }
    );
  }
} 