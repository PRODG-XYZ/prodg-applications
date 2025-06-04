// API route for bulk personnel actions
// POST /api/admin/personnel/bulk-actions

import { NextRequest, NextResponse } from 'next/server';
import { performBulkPersonnelAction } from '@/lib/admin/personnel';
// import { checkAdminPermission } from '@/lib/auth/utils'; // Placeholder for auth check

interface BulkActionRequest {
  action: string;
  personnelIds: string[];
  value?: string;
  data?: any;
}

// POST /api/admin/personnel/bulk-actions - Perform bulk actions on personnel
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    console.log('API: POST /api/admin/personnel/bulk-actions - Permission check placeholder');

    const body: BulkActionRequest = await request.json();
    
    // Validate request body
    if (!body.action || !body.personnelIds || !Array.isArray(body.personnelIds)) {
      return NextResponse.json({ 
        error: 'Invalid request body. Required: action, personnelIds' 
      }, { status: 400 });
    }

    if (body.personnelIds.length === 0) {
      return NextResponse.json({ 
        error: 'No personnel selected for bulk action' 
      }, { status: 400 });
    }

    // Validate action type
    const validActions = ['change_department', 'change_role', 'change_status', 'export_data'];
    if (!validActions.includes(body.action)) {
      return NextResponse.json({ 
        error: `Invalid action. Supported actions: ${validActions.join(', ')}` 
      }, { status: 400 });
    }

    // Handle export action separately
    if (body.action === 'export_data') {
      // For now, just return success - in a real implementation, this would generate and return a CSV
      return NextResponse.json({
        success: true,
        message: `Export initiated for ${body.personnelIds.length} personnel`,
        downloadUrl: '/api/admin/personnel/export?ids=' + body.personnelIds.join(',')
      });
    }

    // Validate that value is provided for actions that require it
    const actionsRequiringValue = ['change_department', 'change_role', 'change_status'];
    if (actionsRequiringValue.includes(body.action) && !body.value) {
      return NextResponse.json({ 
        error: `Action '${body.action}' requires a value` 
      }, { status: 400 });
    }

    // Perform the bulk action
    const results = await performBulkPersonnelAction(
      body.action,
      body.personnelIds,
      body.value
    );

    // Return results
    return NextResponse.json({
      success: true,
      message: `Bulk action '${body.action}' completed`,
      results: {
        total: body.personnelIds.length,
        successful: results.success,
        failed: results.failed,
        errors: results.errors
      }
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to perform bulk action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 