'use client';

import { useState } from 'react';
import DashboardHeader from '@/app/components/admin/DashboardHeader';
import MetricsSection from '@/app/components/admin/MetricsSection';
import RevenueChart from '@/app/components/admin/RevenueChart';
import CategoryChart from '@/app/components/admin/CategoryChart';
import TopProductsChart from '@/app/components/admin/TopProductsChart';
import RecentUsers from '@/app/components/admin/RecentUsers';
import RecentProducts from '@/app/components/admin/RecentProducts';

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <DashboardHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      <MetricsSection />


       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentUsers />
        <RecentProducts />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart timeRange={timeRange} />
        <CategoryChart />
      </div>

      <TopProductsChart />

      {/* Recent Users and Products Tables */}
     
    </div>
  );
}