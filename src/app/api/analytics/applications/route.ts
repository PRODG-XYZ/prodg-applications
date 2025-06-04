import { NextRequest, NextResponse } from 'next/server';
import { 
  getApplicationTrends, 
  getStatusDistribution, 
  getGeographicDistribution,
  AnalyticsFilters 
} from '@/lib/analytics/queries';
import { z } from 'zod';

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['pending', 'reviewing', 'approved', 'rejected']).optional(),
  countries: z.string().optional(), // comma-separated
  skills: z.string().optional(), // comma-separated
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = querySchema.parse(queryParams);
    
    // Parse filters
    const filters: AnalyticsFilters = {};
    
    if (validatedParams.startDate) {
      filters.startDate = new Date(validatedParams.startDate);
    }
    if (validatedParams.endDate) {
      filters.endDate = new Date(validatedParams.endDate);
    }
    if (validatedParams.status) {
      filters.status = validatedParams.status;
    }
    if (validatedParams.countries) {
      filters.countries = validatedParams.countries.split(',').filter(Boolean);
    }
    if (validatedParams.skills) {
      filters.skills = validatedParams.skills.split(',').filter(Boolean);
    }

    // Fetch all application analytics data
    const [trends, statusDistribution, geographicDistribution] = await Promise.all([
      getApplicationTrends(filters),
      getStatusDistribution(filters),
      getGeographicDistribution(filters),
    ]);
    
    return NextResponse.json({
      trends,
      statusDistribution,
      geographicDistribution,
    });
  } catch (error) {
    console.error('Error fetching application analytics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 