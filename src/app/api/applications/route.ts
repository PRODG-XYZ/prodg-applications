import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import { applicationSchema } from '@/lib/validation';

// GET all applications (for dashboard)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let query = {};
    if (status && status !== 'all') {
      query = { status };
    }

    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Application.countDocuments(query);

    return NextResponse.json({
      applications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST new application
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate the data
    const validationResult = applicationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const applicationData = validationResult.data;

    // Check if application with this email already exists
    const existingApplication = await Application.findOne({ 
      email: applicationData.email 
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 409 }
      );
    }

    // Create new application
    const application = new Application(applicationData);
    await application.save();

    return NextResponse.json(
      { 
        message: 'Application submitted successfully!',
        applicationId: application._id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
} 