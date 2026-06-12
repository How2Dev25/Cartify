"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/app/lib/supabase";

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
  updated_at: string;
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
    id: string;
    name: string;
    image_url: string | null;
  };
}

function EmptyOrders() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" }
    );
  }, []);

  return (
    <div ref={containerRef} className="text-center py-20">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-50 mb-6">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">No Orders Yet</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Looks like you haven't placed any orders yet. Start shopping to see your orders here.
      </p>
      <Link 
        href="/products" 
        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        Start Shopping
      </Link>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState(0);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [allOrderItems, setAllOrderItems] = useState<Map<string, OrderItem[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);
  const ordersContainerRef = useRef<HTMLDivElement>(null);
  const trackingRef = useRef<HTMLDivElement>(null);
  const trackingContainerRef = useRef<HTMLDivElement>(null);

  // Fetch orders from database
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setOrders(ordersData || []);
      
      // Fetch items for all orders
      if (ordersData && ordersData.length > 0) {
        const itemsMap = new Map<string, OrderItem[]>();
        
        for (const order of ordersData) {
          const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select(`
              *,
              product:product_id (
                id,
                name,
                image_url
              )
            `)
            .eq("order_id", order.id);
          
          if (!itemsError && items) {
            itemsMap.set(order.id, items);
          }
        }
        
        setAllOrderItems(itemsMap);
        
        if (ordersData.length > 0) {
          setSelectedOrder(0);
          setActiveStep(getStatusStep(ordersData[0].status));
          const firstOrderItems = itemsMap.get(ordersData[0].id) || [];
          setOrderItems(firstOrderItems);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      // Check if we already have items for this order
      if (allOrderItems.has(orderId)) {
        setOrderItems(allOrderItems.get(orderId) || []);
        return;
      }
      
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          *,
          product:product_id (
            id,
            name,
            image_url
          )
        `)
        .eq("order_id", orderId);

      if (error) throw error;
      setOrderItems(data || []);
      
      // Store in map
      if (data) {
        allOrderItems.set(orderId, data);
      }
    } catch (error) {
      console.error("Error fetching order items:", error);
      setOrderItems([]);
    }
  };

  const canCancelOrder = (status: string): boolean => {
    const cancellableStatuses = ["pending", "processing", "paid"];
    return cancellableStatuses.includes(status?.toLowerCase());
  };

  const getCancelButtonText = (status: string): string => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "pending") return "Cancel Order";
    if (statusLower === "processing") return "Cancel & Refund";
    if (statusLower === "paid") return "Cancel & Refund";
    return "Cannot Cancel";
  };

  const createRefund = async (paymentIntentId: string, amount: number): Promise<boolean> => {
    try {
      const response = await fetch("/api/create-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          amount: Math.round(amount * 100),
        }),
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Refund error:", error);
      return false;
    }
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    
    setCancellingOrder(currentOrder.id);
    
    try {
      let refundSuccess = true;
      
      if (currentOrder.payment_intent_id && 
          (currentOrder.status === "paid" || currentOrder.status === "processing")) {
        refundSuccess = await createRefund(currentOrder.payment_intent_id, currentOrder.total);
        
        if (!refundSuccess) {
          throw new Error("Refund failed. Please contact support.");
        }
      }
      
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          notes: cancelReason ? `Cancelled: ${cancelReason}` : "Cancelled by customer",
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentOrder.id);

      if (updateError) throw updateError;

      // Restore product stock
      for (const item of currentItems) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();
        
        if (product) {
          await supabase
            .from("products")
            .update({ stock: product.stock + item.quantity })
            .eq("id", item.product_id);
        }
      }

      await fetchOrders();
      setShowCancelModal(false);
      setCancelReason("");
      
      alert(refundSuccess ? "Order cancelled and refund processed successfully" : "Order cancelled successfully");
      
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      alert(error.message || "Failed to cancel order. Please try again or contact support.");
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusStep = (status: string): number => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "pending": return 0;
      case "processing": return 1;
      case "shipped": return 2;
      case "in transit": return 3;
      case "out for delivery": return 4;
      case "delivered": return 5;
      case "cancelled": return -1;
      case "paid": return 1;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "pending": return "text-yellow-600 bg-yellow-50";
      case "processing": return "text-blue-600 bg-blue-50";
      case "shipped": return "text-purple-600 bg-purple-50";
      case "in transit": return "text-orange-600 bg-orange-50";
      case "out for delivery": return "text-orange-600 bg-orange-50";
      case "delivered": return "text-green-600 bg-green-50";
      case "cancelled": return "text-red-600 bg-red-50";
      case "paid": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "pending": return "Pending";
      case "processing": return "Processing";
      case "shipped": return "Shipped";
      case "in transit": return "In Transit";
      case "out for delivery": return "Out for Delivery";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      case "paid": return "Processing";
      default: return status || "Unknown";
    }
  };

  const getProgressPercentage = (step: number): number => {
    if (step === -1) return 0;
    return (step / 5) * 100;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2)}`;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0 && selectedOrder < orders.length) {
      fetchOrderItems(orders[selectedOrder].id);
      setActiveStep(getStatusStep(orders[selectedOrder].status));
    }
  }, [selectedOrder, orders]);

  // Run animations AFTER orders are loaded and DOM is ready
  useEffect(() => {
    if (loading) return;
    
    const timer = setTimeout(() => {
      gsap.registerPlugin(ScrollTrigger);
      
      if (heroBadgeRef.current) {
        gsap.fromTo(heroBadgeRef.current,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" }
        );
      }
      
      if (heroTitleRef.current) {
        gsap.fromTo(heroTitleRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 1, ease: "elastic.out(1, 0.5)" }
        );
      }
      
      if (ordersContainerRef.current && orders.length > 0) {
        gsap.fromTo(ordersContainerRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: ordersRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
      
      if (trackingContainerRef.current && orders.length > 0) {
        gsap.fromTo(trackingContainerRef.current,
          { opacity: 0, x: 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: trackingRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [loading, orders.length]);

  const currentOrder = orders[selectedOrder];
  const currentItems = orderItems;
  const isCancellable = currentOrder ? canCancelOrder(currentOrder.status) : false;

  const steps = [
    { label: "Order Placed", icon: "📦" },
    { label: "Processing", icon: "⚙️" },
    { label: "Shipped", icon: "🚚" },
    { label: "In Transit", icon: "🔄" },
    { label: "Out for Delivery", icon: "🚛" },
    { label: "Delivered", icon: "✅" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <EmptyOrders />
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>

      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="hero-blur absolute top-20 right-20 w-72 h-72 bg-orange-500 rounded-full filter blur-3xl"></div>
          <div className="hero-blur absolute bottom-20 left-20 w-72 h-72 bg-orange-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div ref={heroBadgeRef} className="opacity-0">
              <span className="inline-block bg-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-orange-400 text-sm font-semibold mb-6">
                Track Your Orders
              </span>
            </div>
            
            <h1 ref={heroTitleRef} className="opacity-0 text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              My <span className="text-orange-500">Orders</span>
            </h1>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path fill="#f9fafb" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Orders List Section */}
      <div ref={ordersRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div ref={ordersContainerRef} className="opacity-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Orders</h2>
            
            <div className="space-y-4">
              {orders.map((order, index) => {
                const orderItemList = allOrderItems.get(order.id) || [];
                const itemCount = orderItemList.reduce((sum, item) => sum + item.quantity, 0);
                const isSelected = selectedOrder === index;
                
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(index);
                      setActiveStep(getStatusStep(order.status));
                      const items = allOrderItems.get(order.id) || [];
                      setOrderItems(items);
                    }}
                    className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md ${
                      isSelected ? "ring-2 ring-orange-500" : ""
                    }`}
                  >
                    {/* Order Header */}
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex flex-wrap justify-between items-start gap-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-mono text-gray-500">#{order.order_number}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-600">{formatCurrency(order.total)}</p>
                          <p className="text-xs text-gray-500">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Items - Product List */}
                    <div className="p-5">
                      <div className="space-y-3">
                        {orderItemList.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <img 
                              src={item.product?.image_url || "https://placehold.co/50x50?text=No+Image"} 
                              alt={item.product?.name || "Product"}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name || "Product"}</p>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                                {item.selected_size && item.selected_size !== "One Size" && (
                                  <span>Size: {item.selected_size}</span>
                                )}
                                {item.selected_color && (
                                  <span>Color: {item.selected_color}</span>
                                )}
                                <span>Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        ))}
                        
                        {orderItemList.length > 3 && (
                          <p className="text-xs text-orange-500 text-center pt-2">
                            + {orderItemList.length - 3} more item{orderItemList.length - 3 !== 1 ? "s" : ""}
                          </p>
                        )}
                        
                        {orderItemList.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-2">No items found</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Order Footer */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {orderItemList.slice(0, 3).map((item, idx) => (
                            <img 
                              key={idx}
                              src={item.product?.image_url || "https://placehold.co/30x30?text=No+Image"} 
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white object-cover bg-gray-100"
                            />
                          ))}
                          {orderItemList.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                              +{orderItemList.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <button 
                        className={`text-xs font-medium transition ${
                          isSelected 
                            ? "text-orange-600" 
                            : "text-gray-400 hover:text-orange-600"
                        }`}
                      >
                        {isSelected ? "Viewing Details →" : "Click to View Details →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details & Tracking */}
      {currentOrder && (
        <div ref={trackingRef} className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div ref={trackingContainerRef} className="opacity-0">
              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Left Column - Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">Order Summary</h3>
                      {isCancellable && (
                        <button
                          onClick={() => setShowCancelModal(true)}
                          disabled={cancellingOrder === currentOrder.id}
                          className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg border border-red-200 hover:border-red-300 transition"
                        >
                          {cancellingOrder === currentOrder.id ? "Processing..." : getCancelButtonText(currentOrder.status)}
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-semibold text-gray-800">{currentOrder.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="text-gray-800">{formatDate(currentOrder.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-semibold ${getStatusColor(currentOrder.status)} px-2 py-0.5 rounded-full text-xs`}>
                          {getStatusText(currentOrder.status)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping Method:</span>
                        <span className="text-gray-800">{currentOrder.shipping_method || "Standard Shipping"}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                      <p className="text-gray-600 text-sm">{currentOrder.shipping_address}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Contact Info</h4>
                      <p className="text-gray-600 text-sm">{currentOrder.customer_name}</p>
                      <p className="text-gray-600 text-sm">{currentOrder.customer_email}</p>
                      <p className="text-gray-600 text-sm">{currentOrder.customer_phone}</p>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Tracking & Items */}
                <div className="lg:col-span-2">
                  {/* Tracking Status Bar */}
                  <div className="bg-orange-50 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">Order Status</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getStatusColor(currentOrder.status)}`}>
                          {getStatusText(currentOrder.status)}
                        </span>
                      </div>
                      {currentOrder.status === "delivered" && (
                        <div className="text-green-600 text-sm font-semibold">✓ Completed</div>
                      )}
                      {currentOrder.status === "cancelled" && (
                        <div className="text-red-600 text-sm font-semibold">✗ Cancelled</div>
                      )}
                    </div>
                    
                    {currentOrder.status !== "cancelled" && (
                      <div className="mt-6">
                        <div className="relative">
                          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                          <div 
                            className="absolute top-5 left-0 h-1 bg-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${getProgressPercentage(activeStep)}%` }}
                          ></div>
                          
                          <div className="relative flex justify-between">
                            {steps.map((step, index) => (
                              <div key={index} className="text-center" style={{ flex: 1 }}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 ${
                                  index <= activeStep 
                                    ? "bg-orange-500 text-white shadow-lg" 
                                    : "bg-gray-200 text-gray-400"
                                }`}>
                                  <span className="text-lg">{step.icon}</span>
                                </div>
                                <p className={`text-xs font-semibold ${index <= activeStep ? "text-orange-600" : "text-gray-400"}`}>
                                  {step.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Order Items Detailed */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items</h3>
                    
                    <div className="space-y-4">
                      {currentItems.map((item) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                          <img 
                            src={item.product?.image_url || "https://placehold.co/100x100?text=No+Image"} 
                            alt={item.product?.name || "Product"}
                            className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{item.product?.name || "Product"}</p>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                              {item.selected_size && item.selected_size !== "One Size" && (
                                <span>Size: {item.selected_size}</span>
                              )}
                              {item.selected_color && (
                                <span>Color: {item.selected_color}</span>
                              )}
                              <span>Quantity: {item.quantity}</span>
                            </div>
                            <p className="text-orange-600 font-semibold mt-2">{formatCurrency(item.price)} each</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                            <p className="text-xs text-gray-400">Total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-800">{formatCurrency(currentOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-green-600">{currentOrder.shipping_cost > 0 ? formatCurrency(currentOrder.shipping_cost) : "Free"}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-xl font-bold text-orange-600">{formatCurrency(currentOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Need Help */}
                  <div className="mt-6 p-4 bg-orange-50 rounded-xl text-center">
                    <p className="text-gray-700">Need help with your order?</p>
                    <Link href="/contact" className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-1 mt-1">
                      Contact Support →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Cancel Order</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Are you sure you want to cancel this order?
              </p>
              {currentOrder?.payment_intent_id && (
                <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                  {currentOrder.status === "processing" || currentOrder.status === "paid" 
                    ? "⚠️ This order has been paid. Cancelling will process a refund to your original payment method."
                    : "⚠️ No payment has been processed yet."}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Changed my mind, Found better price, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancellingOrder === currentOrder?.id}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                {cancellingOrder === currentOrder?.id ? "Processing..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}