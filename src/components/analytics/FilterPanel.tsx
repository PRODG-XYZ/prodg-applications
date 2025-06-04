'use client';

import { useState } from 'react';
import { AnalyticsFilters } from '@/lib/analytics/queries';
import { subDays, subMonths, subYears, format } from 'date-fns';

interface FilterPanelProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

const timeRangeOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last year', value: '1y' },
  { label: 'Custom range', value: 'custom' },
];

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Under Review', value: 'reviewing' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showCustomRange, setShowCustomRange] = useState(false);

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    
    if (range === 'custom') {
      setShowCustomRange(true);
      return;
    }
    
    setShowCustomRange(false);
    
    const endDate = new Date();
    let startDate: Date;
    
    switch (range) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
      case '1y':
        startDate = subYears(endDate, 1);
        break;
      default:
        startDate = subDays(endDate, 30);
    }
    
    onFiltersChange({
      ...filters,
      startDate,
      endDate,
    });
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    const date = new Date(value);
    onFiltersChange({
      ...filters,
      [type === 'start' ? 'startDate' : 'endDate']: date,
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status as any || undefined,
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time Range */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Time Range
          </label>
          <select
            value={selectedTimeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 
                     text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {showCustomRange && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 
                         text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 
                         text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
            </div>
          </>
        )}

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 
                     text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applied Filters Summary */}
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.startDate && filters.endDate && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                         bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
            📅 {format(filters.startDate, 'MMM dd')} - {format(filters.endDate, 'MMM dd')}
          </span>
        )}
        {filters.status && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                         bg-blue-400/20 text-blue-300 border border-blue-400/30">
            📊 Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
          </span>
        )}
        {filters.countries && filters.countries.length > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                         bg-green-400/20 text-green-300 border border-green-400/30">
            🌍 {filters.countries.length} {filters.countries.length === 1 ? 'country' : 'countries'}
          </span>
        )}
        {filters.skills && filters.skills.length > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                         bg-purple-400/20 text-purple-300 border border-purple-400/30">
            💻 {filters.skills.length} {filters.skills.length === 1 ? 'skill' : 'skills'}
          </span>
        )}
      </div>
    </div>
  );
} 