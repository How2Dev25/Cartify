"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(0);
  const [activeStep, setActiveStep] = useState(2); // 0=processing, 1=shipped, 2=in_transit, 3=out_for_delivery, 4=delivered
  
  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);
  const trackingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero animations
    const heroTl = gsap.timeline();
    heroTl
      .fromTo(".hero-badge", 
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" }
      )
      .fromTo(".hero-title", 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1, ease: "elastic.out(1, 0.5)" },
        "-=0.4"
      );
    
    // Orders section animation
    gsap.fromTo(".orders-container",
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
    
    // Tracking section animation
    gsap.fromTo(".tracking-container",
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
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Sample orders data
  const orders = [
    {
      id: "ORD-2024-001",
      date: "December 15, 2024",
      status: "In Transit",
      statusCode: 2,
      total: 189.97,
      items: 3,
      paymentMethod: "Credit Card",
      shippingAddress: "123 Customer St, Quezon City, Metro Manila, Philippines",
      estimatedDelivery: "December 20, 2024",
      trackingNumber: "TRK-888-1234-5678",
      carrier: "Flash Express",
      itemsList: [
        { name: "Classic White Sneakers", quantity: 1, price: 89.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop" },
        { name: "Premium Leather Watch", quantity: 1, price: 199.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop" }
      ]
    },
    {
      id: "ORD-2024-002",
      date: "December 10, 2024",
      status: "Delivered",
      statusCode: 4,
      total: 149.98,
      items: 2,
      paymentMethod: "GCash",
      shippingAddress: "456 Customer Ave, Quezon City, Metro Manila, Philippines",
      estimatedDelivery: "December 14, 2024",
      trackingNumber: "TRK-888-5678-9012",
      carrier: "J&T Express",
      itemsList: [
        { name: "Wireless Headphones", quantity: 1, price: 79.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop" },
        { name: "Designer Handbag", quantity: 1, price: 149.99, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop" }
      ]
    },
    {
      id: "ORD-2024-003",
      date: "December 5, 2024",
      status: "Processing",
      statusCode: 0,
      total: 79.99,
      items: 1,
      paymentMethod: "PayPal",
      shippingAddress: "789 Customer Rd, Quezon City, Metro Manila, Philippines",
      estimatedDelivery: "December 18, 2024",
      trackingNumber: "Pending",
      carrier: "Pending",
      itemsList: [
        { name: "Running Shoes", quantity: 1, price: 79.99, image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=100&h=100&fit=crop" }
      ]
    }
  ];

  const currentOrder = orders[selectedOrder];
  
  // Tracking steps
  const steps = [
    { label: "Order Placed", icon: "📦", description: "Order confirmed and payment verified", date: currentOrder.date },
    { label: "Processing", icon: "⚙️", description: "Preparing your items for shipping", date: currentOrder.date },
    { label: "Shipped", icon: "🚚", description: "Package left our warehouse", date: "December 17, 2024" },
    { label: "In Transit", icon: "🔄", description: "Package is on its way", date: "December 18, 2024" },
    { label: "Out for Delivery", icon: "🚛", description: "Driver is on the way", date: "December 19, 2024" },
    { label: "Delivered", icon: "✅", description: "Package delivered to your address", date: currentOrder.estimatedDelivery }
  ];

  // Parcel location tracking
  const trackingLocations = [
    { location: "Cartify Warehouse, Quezon City", status: "Picked Up", time: "Dec 16, 2024 - 2:30 PM", completed: true },
    { location: "Quezon City Sorting Center", status: "Processed", time: "Dec 16, 2024 - 6:45 PM", completed: true },
    { location: "North Manila Hub", status: "In Transit", time: "Dec 17, 2024 - 9:20 AM", completed: true },
    { location: "Local Delivery Hub, Fairview", status: "Arrived", time: "Dec 18, 2024 - 11:15 AM", completed: activeStep >= 3 },
    { location: "Out for Delivery", status: "With Courier", time: "Dec 19, 2024 - 8:00 AM", completed: activeStep >= 4 },
    { location: "Your Address", status: "Delivered", time: currentOrder.estimatedDelivery, completed: activeStep >= 4 }
  ];

  const getStatusColor = (statusCode: number) => {
    switch(statusCode) {
      case 0: return "text-yellow-600 bg-yellow-50";
      case 1: return "text-blue-600 bg-blue-50";
      case 2: return "text-orange-600 bg-orange-50";
      case 3: return "text-purple-600 bg-purple-50";
      case 4: return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (statusCode: number) => {
    switch(statusCode) {
      case 0: return "Processing";
      case 1: return "Shipped";
      case 2: return "In Transit";
      case 3: return "Out for Delivery";
      case 4: return "Delivered";
      default: return "Unknown";
    }
  };

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
        .tracking-pulse {
          animation: pulse 2s ease-in-out infinite;
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
            <div className="hero-badge opacity-0">
              <span className="inline-block bg-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-orange-400 text-sm font-semibold mb-6">
                Track Your Orders
              </span>
            </div>
            
            <h1 className="hero-title opacity-0 text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
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
          <div className="orders-container opacity-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Orders</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-12">
              {orders.map((order, index) => (
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(index);
                    setActiveStep(order.statusCode);
                  }}
                  className={`text-left p-4 rounded-xl transition-all duration-300 ${
                    selectedOrder === index
                      ? "bg-orange-500 text-white shadow-lg transform scale-105"
                      : "bg-white hover:shadow-md text-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className={`font-semibold ${selectedOrder === index ? "text-white" : "text-gray-800"}`}>
                        {order.id}
                      </p>
                      <p className={`text-sm ${selectedOrder === index ? "text-orange-100" : "text-gray-500"}`}>
                        {order.date}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${selectedOrder === index ? "bg-white text-orange-600" : getStatusColor(order.statusCode)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className={`text-sm font-semibold ${selectedOrder === index ? "text-white" : "text-orange-600"}`}>
                      ₱{order.total.toFixed(2)}
                    </p>
                    <p className={`text-xs ${selectedOrder === index ? "text-orange-100" : "text-gray-500"}`}>
                      {order.items} items
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details & Tracking */}
      <div ref={trackingRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="tracking-container opacity-0">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-semibold text-gray-800">{currentOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="text-gray-800">{currentOrder.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="text-gray-800">{currentOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carrier:</span>
                      <span className="text-gray-800">{currentOrder.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking Number:</span>
                      <span className="text-orange-600 font-semibold">{currentOrder.trackingNumber}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                    <p className="text-gray-600 text-sm">{currentOrder.shippingAddress}</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Estimated Delivery</h4>
                    <p className="text-orange-600 font-semibold">{currentOrder.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Tracking & Items */}
              <div className="lg:col-span-2">
                {/* Tracking Status Bar */}
                <div className="bg-orange-50 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentOrder.statusCode)}`}>
                        {currentOrder.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-mono text-orange-600 font-semibold">{currentOrder.trackingNumber}</p>
                    </div>
                  </div>
                  
                  {/* Step by Step Progress */}
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                      <div 
                        className="absolute top-5 left-0 h-1 bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${(activeStep / 5) * 100}%` }}
                      ></div>
                      
                      <div className="relative flex justify-between">
                        {steps.slice(0, 6).map((step, index) => (
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
                </div>
                
                {/* Parcel Location Tracking */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📍</span> Where is my parcel?
                  </h3>
                  
                  <div className="space-y-4">
                    {trackingLocations.map((location, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="relative">
                          <div className={`w-4 h-4 rounded-full mt-1 ${location.completed ? "bg-orange-500" : "bg-gray-300"}`}></div>
                          {index < trackingLocations.length - 1 && (
                            <div className={`absolute top-5 left-1.5 w-0.5 h-12 ${location.completed ? "bg-orange-500" : "bg-gray-300"}`}></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <p className={`font-semibold ${location.completed ? "text-gray-800" : "text-gray-400"}`}>
                            {location.location}
                          </p>
                          <p className={`text-sm ${location.completed ? "text-gray-600" : "text-gray-400"}`}>
                            {location.status}
                          </p>
                          <p className={`text-xs mt-1 ${location.completed ? "text-gray-500" : "text-gray-400"}`}>
                            {location.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items</h3>
                  
                  <div className="space-y-4">
                    {currentOrder.itemsList.map((item, index) => (
                      <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-orange-600 font-semibold mt-1">₱{item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800">₱{currentOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-xl font-bold text-orange-600">₱{currentOrder.total.toFixed(2)}</span>
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
    </>
  );
}