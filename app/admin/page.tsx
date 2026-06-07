"use client";

export default function AdminDashboardPage() {
  const metrics = {
    totalOrders: 1247,
    totalProducts: 342,
    totalUsers: 8456,
    totalRevenue: 845920,
    pendingOrders: 23,
    lowStock: 12,
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-500">
          <p className="text-sm font-medium text-gray-500 mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500 mb-2">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalProducts.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500 mb-2">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
          <p className="text-sm font-medium text-gray-500 mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₱{metrics.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-2">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-600">{metrics.pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-2">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-orange-600">{metrics.lowStock}</p>
        </div>
      </div>
    </div>
  );
}