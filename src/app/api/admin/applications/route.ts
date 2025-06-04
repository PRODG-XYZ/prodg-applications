import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Communication from '@/lib/models/Communication';
import ApplicationVersion from '@/lib/models/ApplicationVersion';

/**
 * GET /api/admin/applications
 * Returns applications with enhanced metadata for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    // Build query
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get applications with pagination
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get enhanced metadata for each application
    const enhancedApplications = await Promise.all(
      applications.map(async (app) => {
        const [messageStats, versionCount] = await Promise.all([
          Communication.aggregate([
            { $match: { applicationId: app._id.toString() } },
            {
              $group: {
                _id: null,
                totalMessages: { $sum: 1 },
                unreadMessages: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ['$isRead', false] }, { $ne: ['$senderType', 'applicant'] }] },
                      0,
                      { $cond: [{ $eq: ['$senderType', 'applicant'] }, 1, 0] }
                    ]
                  }
                }
              }
            }
          ]),
          ApplicationVersion.countDocuments({ applicationId: app._id.toString() })
        ]);

        const stats = messageStats[0] || { totalMessages: 0, unreadMessages: 0 };

        return {
          ...app.toObject(),
          totalMessages: stats.totalMessages,
          unreadMessages: stats.unreadMessages,
          versionCount
        };
      })
    );

    // Calculate dashboard stats
    const totalApplications = await Application.countDocuments();
    const statusCounts = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await Application.countDocuments({
      createdAt: { $gte: today }
    });

    // Calculate response rate (applications with at least one message from admin)
    const applicationsWithResponse = await Communication.distinct('applicationId', {
      senderType: { $in: ['admin', 'system'] }
    });
    const responseRate = totalApplications > 0 
      ? Math.round((applicationsWithResponse.length / totalApplications) * 100)
      : 0;

    const stats = {
      total: totalApplications,
      pending: statusCounts.find(s => s._id === 'pending')?.count || 0,
      reviewing: statusCounts.find(s => s._id === 'reviewing')?.count || 0,
      approved: statusCounts.find(s => s._id === 'approved')?.count || 0,
      rejected: statusCounts.find(s => s._id === 'rejected')?.count || 0,
      newToday,
      responseRate
    };

    return NextResponse.json({
      applications: enhancedApplications,
      stats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalApplications / limit),
        totalItems: totalApplications,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Admin applications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
} 