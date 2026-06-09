interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  color: 'orange' | 'blue' | 'green' | 'purple';
  subtext?: string;
}

const colorMap = {
  orange: { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-600' },
  blue: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
};

export default function MetricCard({ title, value, icon, change, color, subtext }: MetricCardProps) {
  const colors = colorMap[color];
  
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${colors.border} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && <p className="text-sm text-green-600 mt-2">{change}</p>}
          {subtext && <p className="text-sm text-gray-600 mt-2">{subtext}</p>}
        </div>
        <div className={`${colors.bg} p-3 rounded-lg`}>
          <div className={`w-6 h-6 ${colors.text}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
