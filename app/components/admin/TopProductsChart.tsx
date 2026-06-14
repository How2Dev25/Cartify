"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { fetchTopProducts } from "@/app/lib/dashboardData";
import type { TopProduct } from "@/app/lib/dashboardData";
import { supabase } from "@/app/lib/supabase";

interface TopProductWithImage extends TopProduct {
  image_url?: string;
  product_id?: string;
}

export default function TopProductsChart() {
  const [topProducts, setTopProducts] = useState<TopProductWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  useEffect(() => {
    loadTopProducts();
  }, []);

  const loadTopProducts = async () => {
    setLoading(true);
    const data = await fetchTopProducts(5);
    
    // Fetch product images for each top product
    const productsWithImages = await Promise.all(
      data.map(async (product) => {
        const { data: productData } = await supabase
          .from('products')
          .select('image_url, id')
          .eq('name', product.name)
          .single();
        
        return {
          ...product,
          image_url: productData?.image_url || null,
          product_id: productData?.id,
        };
      })
    );
    
    setTopProducts(productsWithImages);
    setLoading(false);
  };

  // Custom Tooltip with Product Image
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const product = topProducts.find(p => p.name === label);
      
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[220px]">
          <div className="flex items-center gap-3 mb-3">
            {product?.image_url && (
              <img 
                src={product.image_url} 
                alt={label}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">{label}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-green-600">
              📦 Units Sold: <span className="font-semibold">{payload.find((p: any) => p.dataKey === 'sales')?.value}</span>
            </p>
            <p className="text-sm text-purple-600">
              💰 Revenue: <span className="font-semibold">₱{payload.find((p: any) => p.dataKey === 'revenue')?.value?.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle bar hover
  const handleBarMouseEnter = (data: any, index: number) => {
    if (data && data.name) {
      setHoveredBar(data.name);
    }
  };

  const handleBarMouseLeave = () => {
    setHoveredBar(null);
  };

  // Handle product image hover
  const handleProductHover = (productName: string) => {
    setHoveredBar(productName);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading product data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (topProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500">No sales data available yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#82ca9d] rounded"></div>
            <span className="text-gray-500">Units Sold</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#8884d8] rounded"></div>
            <span className="text-gray-500">Revenue (₱)</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={topProducts} 
          margin={{ top: 50, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-25}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis 
            yAxisId="left" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            label={{ value: 'Units Sold', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Revenue (₱)', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#6b7280' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          
          {/* Revenue Bars */}
          <Bar 
            yAxisId="right" 
            dataKey="revenue" 
            fill="#8884d8" 
            name="revenue" 
            radius={[4, 4, 0, 0]}
            onMouseEnter={handleBarMouseEnter}
            onMouseLeave={handleBarMouseLeave}
          >
            {topProducts.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={hoveredBar === entry.name ? '#a05fd8' : '#8884d8'}
              />
            ))}
          </Bar>
          
          {/* Sales Bars */}
          <Bar 
            yAxisId="left" 
            dataKey="sales" 
            fill="#82ca9d" 
            name="sales" 
            radius={[4, 4, 0, 0]}
            onMouseEnter={handleBarMouseEnter}
            onMouseLeave={handleBarMouseLeave}
          >
            {topProducts.map((entry, index) => (
              <Cell 
                key={`cell-sales-${index}`} 
                fill={hoveredBar === entry.name ? '#6bbf8c' : '#82ca9d'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Product Images Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-6">
          {topProducts.map((product) => (
            <div 
              key={product.name} 
              className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105"
              onMouseEnter={() => handleProductHover(product.name)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-200 shadow-sm"
                  title={product.name}
                />
              )}
              <span className="text-xs text-gray-500 text-center max-w-[100px]">
                {product.name.length > 12 ? product.name.substring(0, 10) + '...' : product.name}
              </span>
              <span className="text-xs font-semibold text-orange-500">
                ₱{product.revenue.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}