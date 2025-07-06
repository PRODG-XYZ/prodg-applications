import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Sample departments data - in a real app this would come from a database
    const departments = [
      {
        _id: '1',
        name: 'Engineering',
        code: 'ENG',
        description: 'Software development and technical teams',
        headOfDepartment: 'John Smith',
        memberCount: 25
      },
      {
        _id: '2',
        name: 'Product',
        code: 'PROD',
        description: 'Product management and design teams',
        headOfDepartment: 'Sarah Johnson',
        memberCount: 12
      },
      {
        _id: '3',
        name: 'Marketing',
        code: 'MKT',
        description: 'Marketing and growth teams',
        headOfDepartment: 'Mike Wilson',
        memberCount: 8
      },
      {
        _id: '4',
        name: 'Sales',
        code: 'SALES',
        description: 'Sales and business development teams',
        headOfDepartment: 'Lisa Davis',
        memberCount: 15
      },
      {
        _id: '5',
        name: 'Operations',
        code: 'OPS',
        description: 'Operations and support teams',
        headOfDepartment: 'Tom Brown',
        memberCount: 10
      }
    ];

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
} 