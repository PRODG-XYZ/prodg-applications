'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusDistributionProps {
  data: Array<{
    _id: string;
    count: number;
  }>;
  loading?: boolean;
}

const statusColors = {
  pending: '#f59e0b', // amber-500
  reviewing: '#3b82f6', // blue-500
  approved: '#10b981', // emerald-500
  rejected: '#ef4444', // red-500
};

const statusLabels = {
  pending: 'Pending',
  reviewing: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function StatusDistribution({ data, loading = false }: StatusDistributionProps) {
  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-600 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-600/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Application Status Distribution</h3>
        <div className="flex items-center justify-center h-64 text-slate-400">
          No data available
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => statusLabels[item._id as keyof typeof statusLabels] || item._id),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map(item => statusColors[item._id as keyof typeof statusColors] || '#6b7280'),
        borderColor: data.map(item => statusColors[item._id as keyof typeof statusColors] || '#6b7280'),
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(203, 213, 225)', // slate-300
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgb(30, 41, 59)', // slate-800
        titleColor: 'rgb(248, 250, 252)', // slate-50
        bodyColor: 'rgb(203, 213, 225)', // slate-300
        borderColor: 'rgb(71, 85, 105)', // slate-600
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      },
    },
    cutout: '60%',
  };

  const totalApplications = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Application Status Distribution</h3>
      <div className="relative h-64">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalApplications}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
} 