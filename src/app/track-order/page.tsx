"use client";

import { useState, useEffect } from "react";
import { Search, Package, Truck, CheckCircle, Home, Loader2, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  

  const handleTrack = async (inputId?: string) => {
    const idToTrack = inputId || orderId;
    if (!idToTrack) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders?id=${idToTrack}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Timeline Steps Configuration
  const steps = [
    { key: "pending", label: "Order Placed", icon: Package },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: Home },
  ];

  // Determine active step index
  const getStepIndex = (status: string) => {
    const order = ["pending", "processing", "shipped", "delivered"];
    return order.indexOf(status);
  };
  const DriverMap = dynamic(() => import("@/components/DriverMap"), {
    ssr: false, // This forces it to only load in the browser
    loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />,
  });

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-center text-black dark:text-white font-sora flex-1">
            Track Your Order
          </h1>
          <a 
            href="/shop"
            className="text-pink-600 hover:text-pink-700 font-medium text-sm ml-4"
          >
            Back to Shop
          </a>
        </div>

        {/* Search Input */}
        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-[#E6E6E6] dark:border-[#333333] flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Enter Order ID (e.g. 15)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 bg-[#F5F5F5] dark:bg-[#262626] px-4 py-2 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            onClick={() => handleTrack()}
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Track
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg text-center mb-8">
            {error}
          </div>
        )}

        {/* Results */}
        {order && (
          <div className="space-y-6">
            
            {/* Order Summary Card */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg border border-[#E6E6E6] dark:border-[#333333] overflow-hidden">
              
              {/* Header */}
              <div className="bg-pink-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Order #{order.id}</p>
                    <p className="text-2xl font-bold font-sora mt-1">
                      LSL {(order.total_cents / 100).toFixed(2)}
                    </p>
                    {order.driver_name && (
                      <p className="text-pink-100 text-sm mt-2 flex items-center gap-1">
                        <Truck size={14} /> Driver: {order.driver_name}
                      </p>
                    )}
                  </div>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold uppercase">
                    {order.status}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-8">
                <h3 className="text-lg font-bold text-black dark:text-white mb-6 font-sora">Order Progress</h3>
                
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-[#333333]"></div>

                  {steps.map((step, index) => {
                    const currentIndex = getStepIndex(order.status);
                    const isActive = index <= currentIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="relative flex items-center gap-4 mb-8 last:mb-0">
                        {/* Circle Icon */}
                        <div className={`z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isActive 
                            ? "bg-pink-600 border-pink-600 text-white" 
                            : "bg-white dark:bg-[#1E1E1E] border-gray-300 dark:border-[#444] text-gray-400"
                        }`}>
                          {isActive ? <CheckCircle size={14} /> : <Icon size={14} />}
                        </div>

                        {/* Text */}
                        <div>
                          <p className={`font-semibold text-sm ${isActive ? "text-black dark:text-white" : "text-gray-400"}`}>
                            {step.label}
                          </p>
                          {isActive && index === currentIndex && (
                            <p className="text-xs text-pink-600 dark:text-pink-400 mt-0.5">
                              Current Status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* --- NEW: LIVE MAP SECTION --- */}
            {order.driver_lat && order.driver_lng && (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg border border-[#E6E6E6] dark:border-[#333333] overflow-hidden">
                <div className="p-4 border-b border-[#E6E6E6] dark:border-[#333333] bg-gray-50 dark:bg-[#262626] flex items-center gap-2">
                  <MapPin size={18} className="text-pink-600" />
                  <h3 className="font-bold text-black dark:text-white text-sm">Driver Location</h3>
                </div>
                  <DriverMap 
                  key={`${order.driver_lat}-${order.driver_lng}-${Date.now()}`} 
                  lat={order.driver_lat} 
                  lng={order.driver_lng} 
                  driverName={order.driver_name} 
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}