import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { topProducts } from '@/app/lib/dashboardData';

export default function TopProductsChart() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topProducts}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip formatter={(value, name) => value && typeof value === 'number' ? (name === 'sales' ? value : `₱${value.toLocaleString()}`) : ''} />
          <Legend />
          <Bar yAxisId="left" dataKey="sales" fill="#82ca9d" name="Units Sold" />
          <Bar yAxisId="right" dataKey="revenue" fill="#8884d8" name="Revenue (₱)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
