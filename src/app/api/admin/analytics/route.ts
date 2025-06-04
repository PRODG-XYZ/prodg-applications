// API route for Personnel Analytics
// GET /api/admin/analytics

import { NextResponse } from 'next/server';
import { getPersonnelAnalytics } from '@/lib/admin/personnel';

export async function GET(request: Request) {
  // TODO: Implement actual authentication and permission check
  // const hasPermission = await checkAdminPermission('canViewAnalytics');
  // if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  console.log('API: GET /api/admin/analytics - Permission check placeholder');

  try {
    const analytics = await getPersonnelAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
} 