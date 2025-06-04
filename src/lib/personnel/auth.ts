import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Personnel, { IPersonnel } from '../models/Personnel';
import { connectToDatabase } from '../mongodb';

export type PersonnelRole = 'employee' | 'senior' | 'lead' | 'manager' | 'director';

export interface RolePermissions {
  canCreateProjects: boolean;
  canAssignTasks: boolean;
  canViewAllProjects: boolean;
  canApproveTimesheet: boolean;
  canAccessAnalytics: boolean;
  canManageTeam: boolean;
}

export const rolePermissions: Record<PersonnelRole, RolePermissions> = {
  employee: {
    canCreateProjects: false,
    canAssignTasks: false,
    canViewAllProjects: false,
    canApproveTimesheet: false,
    canAccessAnalytics: false,
    canManageTeam: false
  },
  senior: {
    canCreateProjects: false,
    canAssignTasks: true,
    canViewAllProjects: false,
    canApproveTimesheet: false,
    canAccessAnalytics: true,
    canManageTeam: false
  },
  lead: {
    canCreateProjects: true,
    canAssignTasks: true,
    canViewAllProjects: true,
    canApproveTimesheet: true,
    canAccessAnalytics: true,
    canManageTeam: true
  },
  manager: {
    canCreateProjects: true,
    canAssignTasks: true,
    canViewAllProjects: true,
    canApproveTimesheet: true,
    canAccessAnalytics: true,
    canManageTeam: true
  },
  director: {
    canCreateProjects: true,
    canAssignTasks: true,
    canViewAllProjects: true,
    canApproveTimesheet: true,
    canAccessAnalytics: true,
    canManageTeam: true
  }
};

export interface PersonnelSession {
  personnelId: string;
  email: string;
  role: PersonnelRole;
  permissions: RolePermissions;
  department: string;
  expiresAt: Date;
}

export async function getPersonnelSession(req: NextRequest): Promise<PersonnelSession | null> {
  try {
    const cookieStore = req.cookies || await cookies();
    const sessionCookie = cookieStore.get('personnel-session');
    
    if (!sessionCookie?.value) {
      return null;
    }

    const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
    
    // Check if session is expired
    if (new Date() > new Date(sessionData.expiresAt)) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Error getting personnel session:', error);
    return null;
  }
}

export async function createPersonnelSession(personnel: IPersonnel): Promise<PersonnelSession> {
  const session: PersonnelSession = {
    personnelId: personnel._id,
    email: personnel.email,
    role: personnel.role,
    permissions: rolePermissions[personnel.role],
    department: personnel.department,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set('personnel-session', encodeURIComponent(JSON.stringify(session)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 // 24 hours
  });

  return session;
}

export async function authenticatePersonnel(email: string, password: string): Promise<IPersonnel | null> {
  try {
    await connectToDatabase();
    
    // For now, we'll use a simple check. In production, you'd want proper password hashing
    const personnel = await Personnel.findOne({ email, status: { $ne: 'terminated' } });
    
    if (!personnel) {
      return null;
    }

    // Update last active timestamp
    personnel.lastActiveAt = new Date();
    await personnel.save();

    return personnel;
  } catch (error) {
    console.error('Personnel authentication error:', error);
    return null;
  }
}

export async function clearPersonnelSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('personnel-session');
}

export const withPersonnelAuth = (requiredPermission?: keyof RolePermissions) => {
  return async (req: NextRequest): Promise<{ session: PersonnelSession | null; response?: NextResponse }> => {
    const session = await getPersonnelSession(req);
    
    if (!session) {
      return {
        session: null,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      };
    }
    
    if (requiredPermission && !session.permissions[requiredPermission]) {
      return {
        session: null,
        response: NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      };
    }
    
    return { session };
  };
}; 