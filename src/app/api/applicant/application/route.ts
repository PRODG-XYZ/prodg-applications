import { NextRequest, NextResponse } from 'next/server';
import { requireApplicantAuth } from '@/lib/applicant/auth';
import Application from '@/lib/models/Application';
import ApplicationVersion from '@/lib/models/ApplicationVersion';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * GET /api/applicant/application
 * Returns the complete application data for authenticated applicant
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

    // Get application data
    const application = await Application.findById(authResult.session?.applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Remove sensitive internal fields
    const publicApplication = {
      ...application.toObject(),
      // Remove internal fields that shouldn't be exposed to applicants
      viewCount: undefined,
      timeToReview: undefined,
      reviewerId: undefined,
    };

    return NextResponse.json({ application: publicApplication });
  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve application' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/applicant/application
 * Updates application data (only allowed for certain statuses)
 */
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireApplicantAuth();
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get current application
    const currentApplication = await Application.findById(authResult.session?.applicationId);
    
    if (!currentApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if editing is allowed based on status
    const editableStatuses = ['pending'];
    if (!editableStatuses.includes(currentApplication.status)) {
      return NextResponse.json(
        { error: 'Application cannot be edited in current status' },
        { status: 403 }
      );
    }

    const updates = await request.json();
    
    // Define allowed fields for update
    const allowedFields = [
      'name', 'phone', 'country', 'github', 'linkedin',
      'backgroundDescription', 'experience', 'skills', 
      'portfolioUrl', 'motivation', 'availability'
    ];

    // Filter updates to only allowed fields
    const filteredUpdates: Record<string, any> = {};
    const changes: Array<{field: string, oldValue: any, newValue: any, changedAt: Date}> = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        const oldValue = currentApplication[key as keyof typeof currentApplication];
        if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
          filteredUpdates[key] = value;
          changes.push({
            field: key,
            oldValue,
            newValue: value,
            changedAt: new Date()
          });
        }
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes detected'
      });
    }

    // Update application
    const updatedApplication = await Application.findByIdAndUpdate(
      authResult.session?.applicationId,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    // Create version record if there are changes
    if (changes.length > 0) {
      const latestVersion = await ApplicationVersion.findOne({ 
        applicationId: authResult.session?.applicationId 
      }).sort({ version: -1 });

      await ApplicationVersion.create({
        applicationId: authResult.session?.applicationId,
        version: (latestVersion?.version || 0) + 1,
        changes
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Update application error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
} 