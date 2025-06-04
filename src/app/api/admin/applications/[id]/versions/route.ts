import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ApplicationVersion from '@/lib/models/ApplicationVersion';
import Application from '@/lib/models/Application';

interface Change {
  field: string;
  oldValue: any;
  newValue: any;
  changedAt: Date;
}

/**
 * GET /api/admin/applications/[id]/versions
 * Get version history for a specific application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const applicationId = params.id;

    // Verify application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get all versions for this application
    const versions = await ApplicationVersion.find({
      applicationId
    }).sort({ createdAt: -1 });

    // Format version data for admin view
    const formattedVersions = versions.map(version => ({
      ...version.toObject(),
      changeCount: version.changes.length,
      changedFields: version.changes.map((change: Change) => change.field),
      lastChanged: version.changes.reduce((latest: Date, change: Change) => {
        return change.changedAt > latest ? change.changedAt : latest;
      }, version.createdAt)
    }));

    return NextResponse.json({
      versions: formattedVersions,
      total: versions.length,
      summary: {
        totalVersions: versions.length,
        totalChanges: versions.reduce((sum, v) => sum + v.changes.length, 0),
        mostRecentChange: versions.length > 0 ? versions[0].createdAt : null,
        mostChangedFields: getMostChangedFields(versions)
      }
    });
  } catch (error) {
    console.error('Get versions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch version history' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to analyze which fields are changed most frequently
 */
function getMostChangedFields(versions: any[]): { field: string; count: number }[] {
  const fieldCounts: { [key: string]: number } = {};
  
  versions.forEach(version => {
    version.changes.forEach((change: Change) => {
      fieldCounts[change.field] = (fieldCounts[change.field] || 0) + 1;
    });
  });

  return Object.entries(fieldCounts)
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 most changed fields
} 