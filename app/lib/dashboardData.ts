// app/lib/dashboardData.ts
import { supabase } from "@/app/lib/supabase";

export interface DashboardMetrics {
  totalProducts: number;
  lowStock: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  averageOrderValue: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface RecentProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  image_url: string | null;
  sales: number;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

export interface RevenueDataPoint {
  name: string;
  revenue: number;
  orders: number;
}

export interface RevenueData {
  weekly: RevenueDataPoint[];
  monthly: RevenueDataPoint[];
}

const categoryColors: string[] = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#F7B731', '#A55D5D', '#5D9B9B', '#E8A87C', '#C38D9E'
];

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    // Fetch total products
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) {
      console.error('Products error:', productsError);
    }

    // Fetch low stock products (stock < 10 and stock > 0)
    const { count: lowStock, error: lowStockError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock', 10)
      .gt('stock', 0);

    if (lowStockError) {
      console.error('Low stock error:', lowStockError);
    }

    // Fetch total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Users error:', usersError);
    }

    // Fetch orders data - using correct column names from your schema
    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingOrders = 0;
    
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total, status');  // Using 'total' instead of 'total_amount'

      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
      } else if (orders && orders.length > 0) {
        totalOrders = orders.length;
        totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        pendingOrders = orders.filter(order => 
          order.status === 'pending' || order.status === 'processing'
        ).length;
      }
    } catch (orderErr) {
      console.error('Orders table error:', orderErr);
    }

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalProducts: totalProducts || 0,
      lowStock: lowStock || 0,
      totalUsers: totalUsers || 0,
      totalOrders: totalOrders,
      totalRevenue: totalRevenue,
      pendingOrders: pendingOrders,
      averageOrderValue: averageOrderValue,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      totalProducts: 0,
      lowStock: 0,
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      averageOrderValue: 0,
    };
  }
};

export const fetchCategoryData = async (): Promise<CategoryData[]> => {
  try {
    const { data: products, error } = await supabase.from('products').select('category');
    
    if (error) {
      console.error('Category data error:', error);
      return [];
    }
    
    if (!products || products.length === 0) {
      return [];
    }

    const categoryMap = new Map<string, number>();
    
    products.forEach((product) => {
      if (product.category) {
        categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + 1);
      }
    });

    const total = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);

    if (total === 0) return [];

    return Array.from(categoryMap.entries()).map(([name, count], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Number(((count / total) * 100).toFixed(1)),
      color: categoryColors[index % categoryColors.length],
    }));
  } catch (error) {
    console.error('Error fetching category data:', error);
    return [];
  }
};

export const fetchRecentProducts = async (limit: number = 5): Promise<RecentProduct[]> => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, status, image_url')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productsError) {
      console.error('Recent products error:', productsError);
      return [];
    }
    
    if (!products || products.length === 0) return [];

    const productsWithSales = await Promise.all(
      products.map(async (product) => {
        try {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('quantity')
            .eq('product_id', product.id);

          const totalSales = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
          
          return {
            ...product,
            sales: totalSales,
          };
        } catch (err) {
          return {
            ...product,
            sales: 0,
          };
        }
      })
    );

    return productsWithSales;
  } catch (error) {
    console.error('Error fetching recent products:', error);
    return [];
  }
};

export const fetchTopProducts = async (limit: number = 5): Promise<TopProduct[]> => {
  try {
    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select(`
        quantity,
        price,
        product:product_id (
          id,
          name,
          price
        )
      `);

    if (error) {
      console.error('Top products error:', error);
      return [];
    }
    
    if (!orderItems || orderItems.length === 0) {
      return [];
    }

    const productMap = new Map<string, { name: string; sales: number; revenue: number }>();
    
    orderItems.forEach((item: any) => {
      const productName = item.product?.name || "Unknown Product";
      const quantity = item.quantity || 0;
      const revenue = (item.price || 0) * quantity;
      
      if (productMap.has(productName)) {
        const existing = productMap.get(productName)!;
        existing.sales += quantity;
        existing.revenue += revenue;
      } else {
        productMap.set(productName, {
          name: productName,
          sales: quantity,
          revenue: revenue,
        });
      }
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);

    return topProducts;
  } catch (error) {
    console.error("Error fetching top products:", error);
    return [];
  }
};

export const fetchRevenueData = async (): Promise<RevenueData> => {
  try {
    // Use 'total' column from orders table (not 'total_amount')
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total, created_at, status');

    if (error) {
      console.error('Revenue data error:', error);
      return { weekly: [], monthly: [] };
    }

    if (!orders || orders.length === 0) {
      console.log('No orders found for revenue data');
      return { weekly: [], monthly: [] };
    }

    // Filter paid/delivered orders
    const paidOrders = orders.filter(order => 
      order.status === 'paid' || 
      order.status === 'delivered' || 
      order.status === 'completed'
    );

    if (paidOrders.length === 0) {
      return { weekly: [], monthly: [] };
    }

    // Sort orders by date
    const sortedOrders = [...paidOrders].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const now = new Date();
    
    // Monthly aggregation
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    
    sortedOrders.forEach((order) => {
      if (order.created_at) {
        const date = new Date(order.created_at);
        const month = date.toLocaleString('default', { month: 'short' });
        
        const monthData = monthlyMap.get(month) || { revenue: 0, orders: 0 };
        monthData.revenue += Number(order.total) || 0;
        monthData.orders += 1;
        monthlyMap.set(month, monthData);
      }
    });
    
    // Get last 6 months
    const monthlyData: RevenueDataPoint[] = [];
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = now.getMonth();
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = monthOrder[monthIndex];
      const data = monthlyMap.get(monthName) || { revenue: 0, orders: 0 };
      monthlyData.push({
        name: monthName,
        revenue: data.revenue,
        orders: data.orders,
      });
    }
    
    // Weekly aggregation (last 4 weeks)
    const weeklyData: RevenueDataPoint[] = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7 + 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      let weekRevenue = 0;
      let weekOrders = 0;
      
      sortedOrders.forEach((order) => {
        const orderDate = new Date(order.created_at);
        if (orderDate >= weekStart && orderDate <= weekEnd) {
          weekRevenue += Number(order.total) || 0;
          weekOrders += 1;
        }
      });
      
      weeklyData.push({
        name: `Week ${4 - i}`,
        revenue: weekRevenue,
        orders: weekOrders,
      });
    }
    
    return {
      weekly: weeklyData,
      monthly: monthlyData,
    };
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return { weekly: [], monthly: [] };
  }
};