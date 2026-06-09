import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { revenueData } from '@/app/lib/dashboardData';

interface RevenueChartProps {
  timeRange: 'weekly' | 'monthly';
}

export default function RevenueChart({ timeRange }: RevenueChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Orders Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={revenueData[timeRange]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip formatter={(value) => value ? `₱${value.toLocaleString()}` : ''} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#FF6B6B" name="Revenue (₱)" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#4ECDC4" name="Orders" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
