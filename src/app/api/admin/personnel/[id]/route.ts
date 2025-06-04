// API route for specific personnel details
// PATCH /api/admin/personnel/[id]
// DELETE /api/admin/personnel/[id]

import { NextRequest, NextResponse } from 'next/server';
import {
  getPersonnelById,
  updatePersonnelById,
  deletePersonnelById,
  IPersonnel
} from '@/lib/admin/personnel'; // Assuming @ refers to src path
// import { checkAdminPermission } from '@/lib/auth/utils'; // Placeholder for auth check

// GET /api/admin/personnel/[id] - Get individual personnel details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // TODO: Add authentication check
    console.log(`API: GET /api/admin/personnel/${id} - Permission check placeholder`);

    const personnel = await getPersonnelById(id);
    
    if (!personnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Error fetching personnel:', error);
    return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
  }
}

// PATCH /api/admin/personnel/[id] - Update personnel
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // TODO: Add authentication check
    console.log(`API: PATCH /api/admin/personnel/${id} - Permission check placeholder`);

    const body = await request.json();
    
    // Validate required fields if they're being updated
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const updatedPersonnel = await updatePersonnelById(id, body);
    
    if (!updatedPersonnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPersonnel);
  } catch (error) {
    console.error('Error updating personnel:', error);
    
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json({ error: 'Email or Employee ID already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to update personnel' }, { status: 500 });
  }
}

// DELETE /api/admin/personnel/[id] - Delete/deactivate personnel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // TODO: Add authentication check
    console.log(`API: DELETE /api/admin/personnel/${id} - Permission check placeholder`);

    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      // Hard delete - completely remove from database
      const deleted = await deletePersonnelById(id, true);
      if (!deleted) {
        return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Personnel permanently deleted' });
    } else {
      // Soft delete - change status to terminated
      const updatedPersonnel = await updatePersonnelById(id, { 
        status: 'terminated',
        lastActiveAt: new Date()
      });
      
      if (!updatedPersonnel) {
        return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
      }
      
      return NextResponse.json({ 
        message: 'Personnel deactivated successfully',
        personnel: updatedPersonnel 
      });
    }
  } catch (error) {
    console.error('Error deleting personnel:', error);
    return NextResponse.json({ error: 'Failed to delete personnel' }, { status: 500 });
  }
} 