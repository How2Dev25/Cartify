// app/components/admin/RevenueChart.tsx
"use client";

import { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";
import { fetchRevenueData } from "@/app/lib/dashboardData";
import type { RevenueDataPoint } from "@/app/lib/dashboardData";

interface RevenueChartProps {
  timeRange: "weekly" | "monthly";
  onTimeRangeChange?: (range: "weekly" | "monthly") => void;
}

export default function RevenueChart({ timeRange, onTimeRangeChange }: RevenueChartProps) {
  const [data, setData] = useState<RevenueDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const revenueData = await fetchRevenueData();
      const newData = timeRange === "weekly" ? revenueData.weekly : revenueData.monthly;
      setData(newData);
    } catch (err: any) {
      console.error("Error loading revenue data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, [timeRange]);

  const formatRevenue = (value: number) => {
    if (!value || value === 0) return "₱0";
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(0)}k`;
    return `₱${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-orange-600">
            💰 Revenue: {formatRevenue(payload[0]?.value)}
          </p>
          <p className="text-sm text-blue-600">
            📦 Orders: {payload[1]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
          <div className="flex gap-2">
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading revenue data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onTimeRangeChange?.("weekly")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                timeRange === "weekly"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => onTimeRangeChange?.("monthly")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                timeRange === "monthly"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-red-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">Error loading revenue data</p>
            <button onClick={loadRevenueData} className="mt-2 text-orange-500 text-sm">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0 || data.every(d => d.revenue === 0 && d.orders === 0)) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onTimeRangeChange?.("weekly")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                timeRange === "weekly"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => onTimeRangeChange?.("monthly")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                timeRange === "monthly"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No revenue data available yet</p>
            <p className="text-xs text-gray-400 mt-1">Complete some orders to see data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onTimeRangeChange?.("weekly")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              timeRange === "weekly"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => onTimeRangeChange?.("monthly")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              timeRange === "monthly"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={formatRevenue}
            label={{
              value: "Revenue (₱)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "#6b7280" },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            label={{
              value: "Orders",
              angle: 90,
              position: "insideRight",
              style: { fontSize: 11, fill: "#6b7280" },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            fill="#f97316"
            fillOpacity={0.1}
            stroke="#f97316"
            strokeWidth={2}
            name="Revenue"
          />
          <Bar
            yAxisId="right"
            dataKey="orders"
            fill="#3b82f6"
            fillOpacity={0.8}
            radius={[4, 4, 0, 0]}
            name="Orders"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Revenue Trend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Order Count</span>
          </div>
        </div>
      </div>
    </div>
  );
}