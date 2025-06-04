// API route for Department Management

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Personnel from '@/lib/models/Personnel';
// import { checkAdminPermission } from '@/lib/auth/utils'; // Placeholder for auth check

// GET request to fetch departments (derived from Personnel data)
export async function GET(request: Request) {
  // TODO: Implement actual authentication and permission check
  console.log('API: GET /api/admin/departments - Permission check placeholder');

  try {
    await connectToDatabase();
    
    // Get unique departments from Personnel collection
    const departmentAggregation = await Personnel.aggregate([
      {
        $group: {
          _id: '$department',
          personnelCount: { $sum: 1 },
          personnel: { $push: { _id: '$_id', name: '$name', role: '$role' } }
        }
      },
      {
        $project: {
          _id: { $toString: '$_id' },
          name: '$_id',
          description: { $concat: ['Department of ', '$_id'] },
          personnelCount: 1,
          personnel: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    ]);

    // Transform to match expected Department interface
    const departments = departmentAggregation.map((dept, index) => ({
      _id: `dept_${index + 1}`,
      name: dept.name,
      description: dept.description,
      head: dept.personnel.find((p: any) => p.role === 'lead' || p.role === 'manager')?._id || dept.personnel[0]?._id || '',
      budget: 100000, // Default budget - in real app this would come from a proper Department collection
      personnelCount: dept.personnelCount,
      projects: [], // Would be populated from Project collection
      goals: [], // Would be populated from Department collection
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

// POST request to create a department (simplified implementation)
export async function POST(request: Request) {
  // TODO: Implement actual authentication and permission check
  console.log('API: POST /api/admin/departments - Permission check placeholder');

  try {
    const body = await request.json() as { name: string; description: string; head: string; budget: number };
    
    // Basic validation
    if (!body.name || !body.description) {
      return NextResponse.json({ error: 'Missing required fields: name, description' }, { status: 400 });
    }

    // In a real implementation, this would create a Department document
    // For now, return a mock response since departments are derived from Personnel data
    const newDepartment = {
      _id: `dept_${Date.now()}`,
      name: body.name,
      description: body.description,
      head: body.head || '',
      budget: body.budget || 0,
      personnelCount: 0,
      projects: [],
      goals: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
} 