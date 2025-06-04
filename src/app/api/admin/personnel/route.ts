// API route for Personnel CRUD
// GET /api/admin/personnel
// POST /api/admin/personnel

import { NextRequest, NextResponse } from 'next/server';
import { getPersonnelList, createPersonnelRecord } from '@/lib/admin/personnel';
// import { checkAdminPermission } from '@/lib/auth/utils'; // Placeholder for auth check

// GET /api/admin/personnel - Get all personnel with optional filters
export async function GET(request: NextRequest) {
  // TODO: Add authentication check
  // const hasPermission = await checkAdminPermission('canViewPersonnel');
  // if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  console.log('API: GET /api/admin/personnel - Permission check placeholder');

  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      department: searchParams.get('department') || undefined,
      role: searchParams.get('role') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const personnel = await getPersonnelList(filters);
    return NextResponse.json({ personnel, page: 1, totalPages: 1 });
  } catch (error) {
    console.error('Error fetching personnel:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch personnel',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/admin/personnel - Create new personnel
export async function POST(request: NextRequest) {
  // TODO: Add authentication check
  // const hasPermission = await checkAdminPermission('canManagePersonnel');
  // if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  console.log('API: POST /api/admin/personnel - Permission check placeholder');

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.employeeId) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, and employeeId are required' 
      }, { status: 400 });
    }

    // Create the personnel record
    const newPersonnel = await createPersonnelRecord(body);
    
    return NextResponse.json(newPersonnel, { status: 201 });
  } catch (error) {
    console.error('Error creating personnel:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes('required')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create personnel',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 