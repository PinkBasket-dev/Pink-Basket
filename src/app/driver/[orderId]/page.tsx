"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation, MapPin, Send, Loader2, CheckCircle, User } from "lucide-react";
import dynamic from "next/dynamic";

const DriverMap = dynamic(() => import("@/components/DriverMap"), {
  ssr: false, // CRITICAL: Prevents server-side loading
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />,
});

export default function DriverPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Driver Identity State
  const [driverInfo, setDriverInfo] = useState({ name: "", id: "" });

  // 1. Fetch Order Details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?id=${orderId}`);
        const data = await res.json();
        if (!res.ok) throw new Error("Order not found");
        setOrder(data.order);
      } catch (err) {
        alert("Error loading order. Please check the link.");
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId, router]);

  // 2. Handle Location Update (With Debug Logs)
  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setUpdating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log("GPS Acquired:", latitude, longitude); // Debug log

        try {
          const res = await fetch("/api/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: orderId,
              driver_lat: latitude,
              driver_lng: longitude,
              // Also send driver info in case they haven't saved it yet
              driver_name: driverInfo.name,
              driver_id: driverInfo.id,
            }),
          });

          console.log("API Response Status:", res.status); // Debug log

          if (res.ok) {
            const now = new Date();
            setLastUpdated(now.toLocaleTimeString());
            alert("Location shared with customer!");
          } else {
            const errText = await res.text();
            console.error("API Error Body:", errText);
            alert("Failed to update location. Check console.");
          }
        } catch (error) {
          console.error("Fetch Error:", error);
          alert("Error updating location.");
        } finally {
          setUpdating(false);
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("Unable to retrieve location. Please enable GPS.");
        setUpdating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // 3. Open Native Maps (Use Customer GPS if available, else Text Address)
  const openMaps = () => {
    let url = "";
    if (order?.customer_lat && order?.customer_lng) {
      // Best case: We have exact coordinates
      url = `https://www.google.com/maps/dir/?api=1&destination=${order.customer_lat},${order.customer_lng}`;
    } else {
      // Fallback: Search by address text
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order?.address)}`;
    }
    window.open(url, "_blank");
  };

  // 4. Mark as Delivered
  const handleDelivered = () => {
    if (!driverInfo.name) {
      alert("Please enter your Driver Name first.");
      return;
    }

    if (!confirm("Are you sure you want to mark this order as Delivered?")) return;

    fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: orderId,
        status: "delivered",
        driver_name: driverInfo.name,
        driver_id: driverInfo.id,
      }),
    }).then(() => {
      alert("Order marked as Delivered!");
      router.push("/admin");
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] p-4">
      <div className="max-w-md mx-auto bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl overflow-hidden border border-[#E6E6E6] dark:border-[#333333]">
        
        {/* Header */}
        <div className="bg-pink-600 p-6 text-white">
          <h1 className="text-2xl font-bold font-sora mb-1">Driver Portal</h1>
          <p className="text-pink-100 text-sm">Order #{orderId}</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* 1. Customer Destination Card */}
          <div className="border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-4 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 text-red-600 p-2 rounded-full mt-1">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-black dark:text-white text-sm">Deliver To:</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 leading-relaxed">
                  {order?.address}
                </p>
                <button
                  onClick={openMaps}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold shadow-sm"
                >
                  <Navigation size={16} />
                  Open in Maps
                </button>
              </div>
            </div>
          </div>

          {/* --- NEW: CUSTOMER LOCATION MAP --- */}
          {order?.customer_lat && order?.customer_lng && (
            <div className="border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-4 bg-red-50 dark:bg-red-900/10">
              <h3 className="font-bold text-black dark:text-white text-sm mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                Customer Location (GPS)
              </h3>
             <DriverMap 
                 key="customer-location-map" 
                 lat={order.customer_lat} 
                 lng={order.customer_lng} 
                 driverName={order.customer_name || "Customer"} 
              />
            </div>
          )}
          {/* --------------------------------- */}

          {/* 2. Driver Identity Card */}
          <div className="border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-4">
            <h3 className="font-bold text-black dark:text-white text-sm mb-3 flex items-center gap-2">
              <User size={16} /> Driver Details
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your Name"
                value={driverInfo.name}
                onChange={(e) => setDriverInfo({ ...driverInfo, name: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-sm bg-[#F5F5F5] dark:bg-[#262626] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="text"
                placeholder="Driver ID (Optional)"
                value={driverInfo.id}
                onChange={(e) => setDriverInfo({ ...driverInfo, id: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-sm bg-[#F5F5F5] dark:bg-[#262626] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* 3. My Location Card */}
          <div className="border border-[#E6E6E6] dark:border-[#333333] rounded-xl p-4 bg-green-50 dark:bg-green-900/10">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-600 p-2 rounded-full mt-1">
                <Send size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-black dark:text-white text-sm">Share My Location</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {lastUpdated ? `Last updated: ${lastUpdated}` : "Not shared yet"}
                </p>
                <button
                  onClick={handleUpdateLocation}
                  disabled={updating}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold transition-colors shadow-sm"
                >
                  {updating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <MapPin size={18} />
                      Update GPS Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 4. Mark Delivered Button */}
          <button
            onClick={handleDelivered}
            className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95"
          >
            <CheckCircle size={20} />
            Mark Order as Delivered
          </button>

        </div>
      </div>
    </div>
  );
}