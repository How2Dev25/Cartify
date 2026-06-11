// app/components/admin/MetricsSection.tsx
"use client";

import { useState, useEffect } from "react";
import MetricCard from "./MetricCard";
import { fetchDashboardMetrics } from "@/app/lib/dashboardData";  // Fixed: changed @app to @/app
import type { DashboardMetrics } from "@/app/lib/dashboardData";  // Fixed: changed @app to @/app
import { supabase } from "@/app/lib/supabase";  // Added missing import

export default function MetricsSection() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProducts: 0,
    lowStock: 0,
    totalUsers: 0,  // Fixed: was totallUsers (typo)
  });
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    
    // Fetch basic metrics
    const basicMetrics = await fetchDashboardMetrics();
    setMetrics(basicMetrics);
    
    // Fetch orders data
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status');
      
      if (orders) {
        const total = orders.length;
        const revenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const pending = orders.filter(order => order.status === 'pending' || order.status === 'processing').length;
        
        setTotalOrders(total);
        setTotalRevenue(revenue);
        setPendingOrders(pending);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    
    setLoading(false);
  };

  const IconCart = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );

  const IconBox = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const IconUsers = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const IconMoney = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Orders"
          value={totalOrders}
          icon={<IconCart />}
          change="↑ from last month"
          color="orange"
        />
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts}
          icon={<IconBox />}
          subtext={`${metrics.lowStock} low stock alerts`}
          color="blue"
        />
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          icon={<IconUsers />}
          change="↑ from last month"
          color="green"
        />
        <MetricCard
          title="Total Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          icon={<IconMoney />}
          change="↑ from last month"
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-gray-500">Pending Orders</p>
            <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
              Urgent
            </span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-yellow-600 rounded-full" 
              style={{ width: totalOrders > 0 ? `${(pendingOrders / totalOrders) * 100}%` : '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0}% of total orders
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
            <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded-full text-xs font-medium">
              Action Required
            </span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{metrics.lowStock}</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-orange-600 rounded-full" 
              style={{ width: metrics.totalProducts > 0 ? `${(metrics.lowStock / metrics.totalProducts) * 100}%` : '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {metrics.totalProducts > 0 ? Math.round((metrics.lowStock / metrics.totalProducts) * 100) : 0}% of total products
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-2">Average Order Value</p>
          <p className="text-3xl font-bold text-gray-900">
            ₱{totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0'}
          </p>
          <p className="text-sm text-green-600 mt-2">Current average</p>
          <div className="mt-4 flex gap-2 text-xs text-gray-500">
            <span>Total Orders: {totalOrders}</span>
            <span>•</span>
            <span>Revenue: ₱{totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </>
  );
}