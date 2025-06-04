'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SkillsAnalysisProps {
  data: Array<{
    _id: string;
    count: number;
  }>;
  loading?: boolean;
}

export default function SkillsAnalysis({ data, loading = false }: SkillsAnalysisProps) {
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
        <h3 className="text-lg font-semibold text-white mb-4">Most Common Skills</h3>
        <div className="flex items-center justify-center h-64 text-slate-400">
          No data available
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item._id),
    datasets: [
      {
        label: 'Frequency',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(34, 211, 238, 0.8)', // cyan-400
        borderColor: 'rgb(34, 211, 238)', // cyan-400
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
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
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.x} applications`;
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(71, 85, 105, 0.3)', // slate-600 with opacity
        },
        ticks: {
          color: 'rgb(148, 163, 184)', // slate-400
          stepSize: 1,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(148, 163, 184)', // slate-400
        },
      },
    },
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Most Common Skills (Top 15)</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
} 