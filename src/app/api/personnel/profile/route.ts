import { NextRequest, NextResponse } from 'next/server';
import { withPersonnelAuth } from '@/lib/personnel/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Personnel from '@/lib/models/Personnel';

export async function GET(request: NextRequest) {
  try {
    const { session, response } = await withPersonnelAuth()(request);
    
    if (response) return response;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const personnel = await Personnel.findById(session.personnelId).lean();
    if (!personnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      personnel
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { session, response } = await withPersonnelAuth()(request);
    
    if (response) return response;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const updates = await request.json();
    
    // Validate and sanitize updates
    const allowedUpdates = {
      name: updates.name,
      email: updates.email,
      profile: {
        bio: updates.profile?.bio,
        skills: Array.isArray(updates.profile?.skills) ? updates.profile.skills : [],
        certifications: Array.isArray(updates.profile?.certifications) ? updates.profile.certifications : [],
        socialLinks: {
          github: updates.profile?.socialLinks?.github || '',
          linkedin: updates.profile?.socialLinks?.linkedin || '',
          portfolio: updates.profile?.socialLinks?.portfolio || ''
        },
        avatar: updates.profile?.avatar
      },
      preferences: {
        timezone: updates.preferences?.timezone,
        workingHours: {
          start: updates.preferences?.workingHours?.start,
          end: updates.preferences?.workingHours?.end
        },
        notifications: {
          email: Boolean(updates.preferences?.notifications?.email),
          push: Boolean(updates.preferences?.notifications?.push),
          slack: Boolean(updates.preferences?.notifications?.slack)
        }
      }
    };

    const updatedPersonnel = await Personnel.findByIdAndUpdate(
      session.personnelId,
      { 
        $set: allowedUpdates,
        lastActiveAt: new Date()
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedPersonnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      personnel: updatedPersonnel,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 