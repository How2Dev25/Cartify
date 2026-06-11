"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchCategoryData, type CategoryData } from "@/app/lib/dashboardData";

export default function CategoryChart() {
  const [data, setData] = useState<CategoryData[]>([]);

  useEffect(() => {
    fetchCategoryData().then(setData);
  }, []);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
            outerRadius={100}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}