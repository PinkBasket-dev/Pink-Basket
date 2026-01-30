"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  // 1. Fetch Orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
    refetchOnMount: true, // Refresh when you open the page
  });

  // 2. Update Status Mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] }); // Reload table
    },
  });

  const formatPrice = (cents: number) => `LSL ${(cents / 100).toFixed(2)}`;

  if (isLoading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white font-sora">
            Order History
          </h1>
          <span className="text-sm text-[#6E6E6E] dark:text-[#888888] font-inter bg-white dark:bg-[#1E1E1E] px-3 py-1 rounded border border-[#E6E6E6] dark:border-[#333333]">
            Total Orders: {ordersData?.orders.length || 0}
          </span>
        </div>

        {ordersData?.orders.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-12 text-center border border-[#E6E6E6] dark:border-[#333333]">
            <p className="text-[#6E6E6E] dark:text-[#888888] font-inter text-lg">
              No orders found yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersData?.orders.map((order: any) => (
              <OrderCard key={order.id} order={order} onUpdate={updateStatus.mutate} formatPrice={formatPrice} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdate, formatPrice }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Color code status
  const statusColors: any = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    paid: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-[#E6E6E6] dark:border-[#333333] flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-black dark:text-white font-sora">{order.customer_name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded font-bold font-inter uppercase ${statusColors[order.status] || statusColors.pending}`}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-[#6E6E6E] dark:text-[#888888] font-inter">
            {order.phone} • {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-black dark:text-white font-sora">
            {formatPrice(order.total_cents)}
          </p>
        </div>
      </div>

      {/* Body (Expandable) */}
      {isExpanded && (
        <div className="p-4 bg-[#F5F5F5] dark:bg-[#262626] space-y-3">
          <div>
            <p className="text-xs font-semibold text-[#6E6E6E] dark:text-[#888888] uppercase mb-1">Delivery Address</p>
            <p className="text-sm text-black dark:text-white font-inter">{order.address}</p>
          </div>
          
          <div>
            <p className="text-xs font-semibold text-[#6E6E6E] dark:text-[#888888] uppercase mb-1">Items</p>
            <ul className="list-disc list-inside text-sm text-black dark:text-white space-y-1">
              {(JSON.parse(order.items) as any[]).map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between gap-4">
                  <span>{item.name}</span>
                  <span className="font-bold font-sora">{formatPrice(item.price_cents)} x {item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Footer / Actions */}
      <div className="p-3 bg-white dark:bg-[#1E1E1E] flex justify-between items-center border-t border-[#E6E6E6] dark:border-[#333333]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-medium text-[#4D4D4D] dark:text-[#B0B0B0] hover:text-black dark:hover:text-white font-inter"
        >
          {isExpanded ? "Hide Details" : "View Details"}
        </button>
        
        <div className="flex gap-2">
          {order.status !== 'delivered' && (
            <button
              onClick={() => onUpdate({ id: order.id, status: 'delivered' })}
              className="px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white font-inter font-bold"
            >
              Mark Delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
}