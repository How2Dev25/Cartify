interface DashboardHeaderProps {
  timeRange: 'weekly' | 'monthly';
  onTimeRangeChange: (range: 'weekly' | 'monthly') => void;
}

export default function DashboardHeader({ timeRange, onTimeRangeChange }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => onTimeRangeChange('weekly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === 'weekly' 
              ? 'bg-orange-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Weekly
        </button>
        <button 
          onClick={() => onTimeRangeChange('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === 'monthly' 
              ? 'bg-orange-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Monthly
        </button>
      </div>
    </div>
  );
}
