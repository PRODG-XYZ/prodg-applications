# Analytics Implementation PRD
*Product Requirements Document for Dashboard Analytics Module*

## Overview
Implement comprehensive analytics functionality for the prodg-applications dashboard to provide data-driven insights on application submissions, user engagement, and performance metrics.

## Technical Architecture

### Tech Stack Integration
- **Framework**: Next.js 15 with React 19
- **Database**: MongoDB with Mongoose ODM
- **UI Components**: Existing UI library (Tailwind CSS + custom components)
- **Charts**: Chart.js or Recharts for data visualization
- **State Management**: React hooks (useState, useEffect, useCallback)
- **API**: Next.js API routes

### Database Schema Extensions

#### New Analytics Collection
```typescript
interface IAnalytics {
  _id: string;
  type: 'application_submitted' | 'application_viewed' | 'dashboard_access' | 'user_login';
  timestamp: Date;
  applicationId?: string;
  userId?: string;
  metadata?: {
    country?: string;
    userAgent?: string;
    referrer?: string;
    sessionId?: string;
  };
}
```

#### Application Model Enhancements
```typescript
// Add to existing IApplication interface
interface IApplication {
  // ... existing fields
  viewCount: number;
  lastViewed: Date;
  timeToReview?: number; // in hours
  reviewerId?: string;
}
```

## Core Features

### 1. Application Metrics Dashboard

#### Components Required
- **AnalyticsDashboard.tsx**: Main analytics container
- **MetricsCard.tsx**: Individual metric display component
- **ApplicationChart.tsx**: Application submissions over time
- **StatusDistribution.tsx**: Application status breakdown
- **GeographicDistribution.tsx**: Applications by country
- **SkillsAnalysis.tsx**: Most common skills analysis

#### API Endpoints
```typescript
// GET /api/analytics/applications
// Returns: Application submission trends, status distribution, geographic data

// GET /api/analytics/metrics
// Returns: Key performance indicators (KPIs)

// GET /api/analytics/skills
// Returns: Skills frequency analysis

// POST /api/analytics/track
// Body: { type, metadata }
// Purpose: Track user interactions
```

### 2. Real-time Metrics

#### KPI Cards
1. **Total Applications**: Count with period-over-period change
2. **Pending Reviews**: Count with average review time
3. **Approval Rate**: Percentage with trend indicator
4. **Average Response Time**: Hours/days with target comparison

#### Implementation
```typescript
// Hook for real-time updates
const useRealTimeAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>();
  
  useEffect(() => {
    const interval = setInterval(fetchMetrics, 300000); // 5 min refresh
    return () => clearInterval(interval);
  }, []);
};
```

### 3. Interactive Charts

#### Chart Types
1. **Line Chart**: Application submissions over time (daily/weekly/monthly)
2. **Donut Chart**: Application status distribution
3. **Bar Chart**: Applications by country (top 10)
4. **Horizontal Bar**: Most common skills (top 15)
5. **Heatmap**: Application submission patterns by day/hour

#### Chart Component Structure
```typescript
interface ChartProps {
  data: any[];
  timeRange: '7d' | '30d' | '90d' | '1y';
  chartType: 'line' | 'bar' | 'donut' | 'heatmap';
  loading?: boolean;
}
```

### 4. Filtering & Time Range Selection

#### Filter Options
- **Time Range**: Last 7 days, 30 days, 90 days, 1 year, custom range
- **Status Filter**: All, Pending, Reviewing, Approved, Rejected
- **Country Filter**: Multi-select dropdown
- **Skills Filter**: Multi-select with search

#### URL State Management
```typescript
// URL structure: /dashboard/analytics?range=30d&status=pending&country=US,CA
const useAnalyticsFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const updateFilters = (filters: AnalyticsFilters) => {
    const params = new URLSearchParams(searchParams);
    // Update URL parameters
    router.push(`?${params.toString()}`);
  };
};
```

## File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── analytics/
│   │       ├── page.tsx              # Analytics main page
│   │       └── loading.tsx           # Loading state
│   └── api/
│       └── analytics/
│           ├── applications/
│           │   └── route.ts          # Application analytics API
│           ├── metrics/
│           │   └── route.ts          # KPI metrics API
│           ├── skills/
│           │   └── route.ts          # Skills analysis API
│           └── track/
│               └── route.ts          # Event tracking API
├── components/
│   └── analytics/
│       ├── AnalyticsDashboard.tsx    # Main container
│       ├── MetricsCard.tsx           # KPI display
│       ├── ApplicationChart.tsx      # Charts wrapper
│       ├── StatusDistribution.tsx    # Status breakdown
│       ├── GeographicChart.tsx       # Country distribution
│       ├── SkillsAnalysis.tsx        # Skills frequency
│       ├── FilterPanel.tsx           # Filter controls
│       └── DateRangePicker.tsx       # Date selection
├── lib/
│   ├── models/
│   │   └── Analytics.ts              # Analytics data model
│   ├── analytics/
│   │   ├── queries.ts                # Database queries
│   │   ├── aggregations.ts           # Data aggregation logic
│   │   └── tracking.ts               # Event tracking utilities
│   └── hooks/
│       ├── useAnalytics.ts           # Analytics data hook
│       └── useRealTimeMetrics.ts     # Real-time updates hook
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
1. Create Analytics model and database migrations
2. Implement basic API endpoints (/api/analytics/*)
3. Set up event tracking system
4. Create AnalyticsDashboard page structure

### Phase 2: Basic Metrics (Week 2)
1. Implement KPI cards with real-time updates
2. Create application submission trends chart
3. Add status distribution visualization
4. Implement basic filtering (time range)

### Phase 3: Advanced Analytics (Week 3)
1. Geographic distribution analysis
2. Skills frequency analysis
3. Advanced filtering (status, country, skills)
4. Export functionality (CSV/PDF)

### Phase 4: Performance & Polish (Week 4)
1. Optimize database queries with aggregation pipelines
2. Implement caching for frequently accessed metrics
3. Add loading states and error handling
4. Performance testing and optimization

## Performance Considerations

### Database Optimization
```typescript
// Aggregation pipeline for efficient analytics queries
const applicationTrends = await Application.aggregate([
  {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      count: { $sum: 1 },
      statuses: { $push: "$status" }
    }
  },
  { $sort: { _id: 1 } }
]);
```

### Caching Strategy
- Redis cache for frequently accessed metrics (5-minute TTL)
- Browser-side caching for static data
- Optimistic updates for real-time metrics

### Data Loading
```typescript
// Implement skeleton loading states
const AnalyticsSkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-slate-700/30 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-slate-600 rounded w-full"></div>
      </div>
    ))}
  </div>
);
```

## Dependencies to Add

```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^3.6.0",
    "react-daterange-picker": "^2.4.0"
  },
  "devDependencies": {
    "@types/chart.js": "^2.9.41"
  }
}
```

## Error Handling & Validation

### API Error Responses
```typescript
interface AnalyticsErrorResponse {
  error: string;
  code: 'INVALID_DATE_RANGE' | 'INSUFFICIENT_DATA' | 'UNAUTHORIZED';
  details?: string;
}
```

### Input Validation
```typescript
const analyticsQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['pending', 'reviewing', 'approved', 'rejected']).optional(),
  countries: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});
```

## Testing Requirements

### Unit Tests
- Analytics data aggregation functions
- Chart data transformation logic
- Filter validation and URL state management

### Integration Tests
- API endpoint responses
- Database query performance
- Real-time metric updates

### E2E Tests
- Analytics dashboard navigation
- Filter interactions
- Chart rendering with different data sets

## Security Considerations

### Access Control
- Implement role-based access (admin/reviewer only)
- Rate limiting on analytics API endpoints
- Data sanitization for aggregated queries

### Data Privacy
- No PII in analytics tracking
- Anonymize geographic data beyond country level
- Implement data retention policies

## Monitoring & Alerting

### Performance Metrics
- API response times for analytics endpoints
- Database query execution times
- Frontend rendering performance

### Business Metrics
- Dashboard usage analytics
- Most viewed analytics sections
- Filter usage patterns

---

**Implementation Priority**: High
**Estimated Effort**: 4 weeks
**Dependencies**: None (uses existing tech stack)
**Risk Level**: Low (incremental feature addition) 