// Dashboard mock data
import { supabase } from "@/app/lib/supabase";  // Fixed: changed @app to @/app

export interface DashboardMetrics {
  totalProducts: number;
  lowStock: number;
  totalUsers: number;
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

    if (productsError) throw productsError;

    // Fetch low stock products (stock < 10 and stock > 0)
    const { count: lowStock, error: lowStockError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock', 10)
      .gt('stock', 0);

    if (lowStockError) throw lowStockError;

    // Fetch total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    return {
      totalProducts: totalProducts || 0,
      lowStock: lowStock || 0,
      totalUsers: totalUsers || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      totalProducts: 0,
      lowStock: 0,
      totalUsers: 0,
    };
  }
};



export const fetchCategoryData = async (): Promise<CategoryData[]> => {
  const { data: products } = await supabase.from('products').select('category');
  
  if (!products) return [];

  const categoryMap = new Map<string, number>();
  
  products.forEach((product) => {
    if (product.category) {
      categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + 1);
    }
  });

  const total = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);

  return Array.from(categoryMap.entries()).map(([name, count], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Number(((count / total) * 100).toFixed(1)),
    color: categoryColors[index % categoryColors.length],
  }));
};


export const fetchRecentProducts = async (limit: number = 5): Promise<RecentProduct[]> => {
  try {
    // Fetch recent products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, status, image_url')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productsError) throw productsError;
    if (!products) return [];

    // Fetch sales for each product
    const productsWithSales = await Promise.all(
      products.map(async (product) => {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('quantity')
          .eq('product_id', product.id);

        const totalSales = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        
        return {
          ...product,
          sales: totalSales,
        };
      })
    );

    return productsWithSales;
  } catch (error) {
    console.error('Error fetching recent products:', error);
    return [];
  }
};

export const topProducts = [
  { name: 'Wireless Headphones', sales: 234, revenue: 701766 },
  { name: 'Smart Watch', sales: 189, revenue: 1039311 },
  { name: 'Laptop Backpack', sales: 167, revenue: 216933 },
  { name: 'USB-C Hub', sales: 145, revenue: 130355 },
  { name: 'Mechanical Keyboard', sales: 128, revenue: 499072 },
];
export const revenueData = {
  weekly: [
    { name: 'Week 1', revenue: 125000, orders: 180 },
    { name: 'Week 2', revenue: 142000, orders: 210 },
    { name: 'Week 3', revenue: 138000, orders: 195 },
    { name: 'Week 4', revenue: 165000, orders: 230 },
  ],
  monthly: [
    { name: 'Jan', revenue: 450000, orders: 580 },
    { name: 'Feb', revenue: 520000, orders: 620 },
    { name: 'Mar', revenue: 490000, orders: 600 },
    { name: 'Apr', revenue: 580000, orders: 680 },
    { name: 'May', revenue: 610000, orders: 720 },
    { name: 'Jun', revenue: 845920, orders: 1247 },
  ],
};