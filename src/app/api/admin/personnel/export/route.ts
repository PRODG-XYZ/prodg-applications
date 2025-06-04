import { NextRequest, NextResponse } from 'next/server';
import { getPersonnelById, IPersonnel } from '@/lib/admin/personnel';

// GET /api/admin/personnel/export - Export personnel data as CSV
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    console.log('API: GET /api/admin/personnel/export - Permission check placeholder');

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',') || [];

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No personnel IDs provided' }, { status: 400 });
    }

    // Fetch all requested personnel
    const personnelPromises = ids.map(id => getPersonnelById(id));
    const personnelResults = await Promise.all(personnelPromises);
    const personnel = personnelResults.filter((p): p is IPersonnel => p !== null); // Remove any null results

    if (personnel.length === 0) {
      return NextResponse.json({ error: 'No valid personnel found' }, { status: 404 });
    }

    // Define CSV headers
    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Department',
      'Role',
      'Status',
      'Start Date',
      'Skills',
      'Certifications'
    ];

    // Convert personnel data to CSV rows
    const rows = personnel.map(person => [
      person.employeeId,
      person.name,
      person.email,
      person.department,
      person.role,
      person.status,
      person.startDate ? new Date(person.startDate).toISOString().split('T')[0] : '',
      person.profile?.skills?.join(', ') || '',
      person.profile?.certifications?.join(', ') || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Properly escape cells with commas, quotes, or newlines
        if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(','))
    ].join('\n');

    // Set headers for CSV download
    const headers4Response = new Headers();
    headers4Response.set('Content-Type', 'text/csv');
    headers4Response.set('Content-Disposition', `attachment; filename="personnel_export_${new Date().toISOString().split('T')[0]}.csv"`);

    return new NextResponse(csvContent, {
      status: 200,
      headers: headers4Response
    });
  } catch (error) {
    console.error('Error exporting personnel data:', error);
    return NextResponse.json({ 
      error: 'Failed to export personnel data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 