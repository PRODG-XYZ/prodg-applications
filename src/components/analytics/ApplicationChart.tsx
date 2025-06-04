'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ApplicationChartProps {
  data: Array<{
    _id: string;
    count: number;
    statuses: string[];
  }>;
  loading?: boolean;
  title?: string;
}

export default function ApplicationChart({ 
  data, 
  loading = false, 
  title = "Application Trends" 
}: ApplicationChartProps) {
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
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-slate-400">
          No data available
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => {
      const date = new Date(item._id);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Applications Submitted',
        data: data.map(item => item.count),
        borderColor: 'rgb(34, 211, 238)', // cyan-400
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 211, 238)',
        pointBorderColor: 'rgb(34, 211, 238)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgb(30, 41, 59)', // slate-800
        titleColor: 'rgb(248, 250, 252)', // slate-50
        bodyColor: 'rgb(203, 213, 225)', // slate-300
        borderColor: 'rgb(71, 85, 105)', // slate-600
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)', // slate-600 with opacity
        },
        ticks: {
          color: 'rgb(148, 163, 184)', // slate-400
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(71, 85, 105, 0.3)', // slate-600 with opacity
        },
        ticks: {
          color: 'rgb(148, 163, 184)', // slate-400
          stepSize: 1,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
} 