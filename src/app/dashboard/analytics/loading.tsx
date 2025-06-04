export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="h-10 bg-slate-700/30 rounded w-80 mb-2 animate-pulse"></div>
            <div className="h-6 bg-slate-700/30 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-slate-700/30 rounded w-32 animate-pulse"></div>
        </div>

        {/* Filter Panel Skeleton */}
        <div className="bg-slate-800/50 rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-slate-600 rounded w-20 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-slate-600 rounded w-20 mb-2"></div>
                <div className="h-10 bg-slate-700/50 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-slate-600 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-slate-600 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-slate-600 rounded w-32"></div>
                </div>
                <div className="h-8 w-8 bg-slate-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-slate-600 rounded w-48 mb-4"></div>
              <div className="h-64 bg-slate-600/30 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 