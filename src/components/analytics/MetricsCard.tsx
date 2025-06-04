'use client';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  isPercentage?: boolean;
}

export default function MetricsCard({ 
  title, 
  value, 
  change, 
  icon, 
  isPercentage = false 
}: MetricsCardProps) {
  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    if (isPercentage) {
      return `${sign}${change.toFixed(1)}%`;
    }
    return `${sign}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-lg p-6 
                    hover:bg-slate-700/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${getChangeColor(change)}`}>
              <span className="mr-1">{getChangeIcon(change)}</span>
              <span>{formatChange(change)}</span>
              <span className="text-slate-500 ml-1">vs previous period</span>
            </div>
          )}
        </div>
        
        <div className="text-2xl opacity-70">
          {icon}
        </div>
      </div>
    </div>
  );
} 