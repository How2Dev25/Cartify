// Dashboard mock data
export const metrics = {
  totalOrders: 1247,
  totalProducts: 342,
  totalUsers: 8456,
  totalRevenue: 845920,
  pendingOrders: 23,
  lowStock: 12,
};

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

export const categoryData = [
  { name: 'Electronics', value: 35, color: '#FF6B6B' },
  { name: 'Clothing', value: 28, color: '#4ECDC4' },
  { name: 'Home & Living', value: 20, color: '#45B7D1' },
  { name: 'Books', value: 12, color: '#96CEB4' },
  { name: 'Others', value: 5, color: '#FFEAA7' },
];

export const recentProducts = [
  { id: 1, name: 'Wireless Headphones', price: 2999, stock: 45, sales: 128, status: 'In Stock' },
  { id: 2, name: 'Smart Watch', price: 5499, stock: 23, sales: 89, status: 'In Stock' },
  { id: 3, name: 'Laptop Backpack', price: 1299, stock: 8, sales: 234, status: 'Low Stock' },
  { id: 4, name: 'USB-C Hub', price: 899, stock: 56, sales: 167, status: 'In Stock' },
  { id: 5, name: 'Mechanical Keyboard', price: 3899, stock: 3, sales: 45, status: 'Low Stock' },
];

export const topProducts = [
  { name: 'Wireless Headphones', sales: 234, revenue: 701766 },
  { name: 'Smart Watch', sales: 189, revenue: 1039311 },
  { name: 'Laptop Backpack', sales: 167, revenue: 216933 },
  { name: 'USB-C Hub', sales: 145, revenue: 130355 },
  { name: 'Mechanical Keyboard', sales: 128, revenue: 499072 },
];
