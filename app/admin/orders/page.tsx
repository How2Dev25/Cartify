"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { isAdmin } from "@/app/lib/auth";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_method: string;
  shipping_address: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  payment_intent_id: string | null;
  paid_at: string | null;
  user_id: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  selected_size: string | null;
  selected_color: string | null;
  product: {
    name: string;
    image_url: string | null;
  };
}

interface CustomerProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string | null;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [orderItemsMap, setOrderItemsMap] = useState<Map<string, OrderItem[]>>(new Map());
  const [customerProfilesMap, setCustomerProfilesMap] = useState<Map<string, CustomerProfile>>(new Map());
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  const router = useRouter();

  // Check admin access
  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await isAdmin();
      if (!admin) {
        router.push("/");
      }
    };
    checkAdmin();
    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      
      // Fetch order items and customer profiles for all orders
      if (data && data.length > 0) {
        const itemsMap = new Map<string, OrderItem[]>();
        const profilesMap = new Map<string, CustomerProfile>();
        
        for (const order of data) {
          // Fetch order items
          const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select(`
              *,
              product:product_id (
                name,
                image_url
              )
            `)
            .eq("order_id", order.id);
          
          if (!itemsError && items) {
            itemsMap.set(order.id, items);
          }
          
          // Fetch customer profile
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", order.user_id)
            .single();
          
          if (!profileError && profile) {
            profilesMap.set(order.user_id, profile);
          }
        }
        
        setOrderItemsMap(itemsMap);
        setCustomerProfilesMap(profilesMap);
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      if (orderItemsMap.has(orderId)) {
        setOrderItems(orderItemsMap.get(orderId) || []);
        return;
      }
      
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          *,
          product:product_id (
            name,
            image_url
          )
        `)
        .eq("order_id", orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error("Error fetching order items:", error);
      setOrderItems([]);
    }
  };

  const fetchCustomerProfile = async (userId: string) => {
    try {
      if (customerProfilesMap.has(userId)) {
        setCustomerProfile(customerProfilesMap.get(userId) || null);
        return;
      }
      
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setCustomerProfile(data);
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      setCustomerProfile(null);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(query) ||
        order.customer_name?.toLowerCase().includes(query) ||
        order.customer_email?.toLowerCase().includes(query)
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
      
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    await Promise.all([
      fetchOrderItems(order.id),
      fetchCustomerProfile(order.user_id)
    ]);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "paid": return "bg-blue-100 text-blue-700";
      case "shipped": return "bg-purple-100 text-purple-700";
      case "in transit": return "bg-orange-100 text-orange-700";
      case "out for delivery": return "bg-orange-100 text-orange-700";
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "payment_failed": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch(status?.toLowerCase()) {
      case "pending": return "Pending";
      case "processing": return "Processing";
      case "paid": return "Paid";
      case "shipped": return "Shipped";
      case "in transit": return "In Transit";
      case "out for delivery": return "Out for Delivery";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      case "payment_failed": return "Payment Failed";
      default: return status || "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2)}`;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
  };

  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    document.getElementById('orders-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  const exportOrders = () => {
    const headers = ["Order ID", "Customer", "Email", "Date", "Total", "Status"];
    const csvData = filteredOrders.map(order => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      formatDate(order.created_at),
      formatCurrency(order.total),
      getStatusText(order.status)
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentOrders = getCurrentPageItems();
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredOrders.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Orders</h3>
              <p className="text-sm text-gray-500 mt-1">Manage and track customer orders</p>
            </div>
            <button 
              onClick={exportOrders}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Orders
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="in transit">In Transit</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="payment_failed">Payment Failed</option>
            </select>
          </div>

          {(searchQuery || selectedStatus !== "all") && (
            <div className="mt-3 text-right">
              <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                Clear all filters
              </button>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredOrders.length > 0 ? startIndex : 0} to {endIndex} of {filteredOrders.length} orders
          </div>
        </div>

        <div className="overflow-x-auto" id="orders-table">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentOrders.map((order) => {
                const orderItemList = orderItemsMap.get(order.id) || [];
                const productImages = orderItemList.slice(0, 3);
                const remainingCount = orderItemList.length - 3;
                const customerProfileData = customerProfilesMap.get(order.user_id);
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                          {customerProfileData?.avatar_url ? (
                            <img src={customerProfileData.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getCustomerInitials(order.customer_name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{order.customer_name}</p>
                          <p className="text-xs text-gray-500 truncate">{order.customer_email}</p>
                          {customerProfileData?.phone && (
                            <p className="text-xs text-gray-400 mt-0.5">{customerProfileData.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {productImages.map((item, idx) => (
                          <div key={idx} className="relative group/img">
                            <img 
                              src={item.product?.image_url || "https://placehold.co/40x40?text=No+Image"} 
                              alt={item.product?.name || "Product"}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 shadow-sm"
                            />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none z-10">
                              {item.product?.name} x{item.quantity}
                            </div>
                          </div>
                        ))}
                        {remainingCount > 0 && (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            +{remainingCount}
                          </div>
                        )}
                        {orderItemList.length === 0 && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-orange-600">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-gray-400">{orderItemList.length} item{orderItemList.length !== 1 ? "s" : ""}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={updatingStatus}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-orange-500 cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="in transit">In Transit</option>
                        <option value="out for delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="payment_failed">Payment Failed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition px-2 py-1 rounded hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      currentPage === pageNum
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-gray-500">No orders found</p>
            {(searchQuery || selectedStatus !== "all") && (
              <button onClick={clearFilters} className="mt-4 text-orange-500 hover:text-orange-600 font-medium">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-white p-6 border-b border-gray-200 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
                  <p className="text-sm text-gray-500 mt-1">#{selectedOrder.order_number}</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Profile Section */}
              <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-5 border border-orange-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Profile
                </h4>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {customerProfile?.avatar_url ? (
                      <img src={customerProfile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getCustomerInitials(selectedOrder.customer_name)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Full Name</p>
                        <p className="text-gray-900 font-medium">{customerProfile?.first_name} {customerProfile?.last_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Email</p>
                        <p className="text-gray-900">{selectedOrder.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Phone</p>
                        <p className="text-gray-900">{customerProfile?.phone || selectedOrder.customer_phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Member Since</p>
                        <p className="text-gray-900">{customerProfile?.created_at ? formatDate(customerProfile.created_at) : "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Shipping Information
                </h4>
                <p className="text-sm text-gray-700">{selectedOrder.shipping_address}</p>
                <p className="text-sm text-gray-500 mt-2">Method: {selectedOrder.shipping_method}</p>
              </div>

              {/* Order Items with Photos */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Order Items ({orderItems.length})
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img 
                          src={item.product?.image_url || "https://placehold.co/80x80?text=No+Image"} 
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product?.name || "Product"}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                          {item.selected_size && <span className="bg-white px-2 py-0.5 rounded">Size: {item.selected_size}</span>}
                          {item.selected_color && <span className="bg-white px-2 py-0.5 rounded">Color: {item.selected_color}</span>}
                          <span className="bg-white px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                        </div>
                        <p className="text-orange-600 font-semibold text-sm mt-1">{formatCurrency(item.price)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-xs text-gray-400">Total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.shipping_cost)}</span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Notes</span>
                      <span className="text-gray-600 italic">{selectedOrder.notes}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-orange-600 text-lg">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update and Actions */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Order Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    disabled={updatingStatus}
                    className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="in transit">In Transit</option>
                    <option value="out for delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="payment_failed">Payment Failed</option>
                  </select>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}