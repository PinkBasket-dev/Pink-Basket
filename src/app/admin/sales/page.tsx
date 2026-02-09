"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Package, Users, TrendingUp, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default function SalesPage() {
  // 1. Fetch Orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      const data = await res.json();
      return data.orders || [];
    },
  });

  // 2. Fetch Products (To map Categories to products)
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      return data.products || [];
    },
  });

  // --- CALCULATE STATS ---
  const stats = useMemo(() => {
    if (!ordersData || !productsData) return { revenue: 0, orders: 0, items: 0, byClient: [], byProduct: [], byCategory: [] };

    let totalRevenue = 0;
    let totalItems = 0;
    const clientMap: Record<string, { revenue: number; count: number }> = {};
    const productMap: Record<string, { revenue: number; quantity: number }> = {};
    const categoryMap: Record<string, { revenue: number; quantity: number }> = {};

    // Create a lookup for Product -> Category
    const productToCategory: Record<number, string> = {};
    productsData.forEach((p: any) => {
      productToCategory[p.id] = p.category_name; // Assuming the API joins category_name
    });

    ordersData.forEach((order: any) => {
      totalRevenue += order.total_cents;
      
      // Client Stats
      if (!clientMap[order.customer_name]) {
        clientMap[order.customer_name] = { revenue: 0, count: 0 };
      }
      clientMap[order.customer_name].revenue += order.total_cents;
      clientMap[order.customer_name].count += 1;

      // Item Stats
      try {
        const items = JSON.parse(order.items);
        items.forEach((item: any) => {
          totalItems += item.quantity;

          // Product Stats
          if (!productMap[item.name]) {
            productMap[item.name] = { revenue: 0, quantity: 0 };
          }
          productMap[item.name].revenue += (item.price_cents * item.quantity);
          productMap[item.name].quantity += item.quantity;

          // Category Stats (Mapping via Product)
          const categoryName = productToCategory[item.id] || "Uncategorized";
          if (!categoryMap[categoryName]) {
            categoryMap[categoryName] = { revenue: 0, quantity: 0 };
          }
          categoryMap[categoryName].revenue += (item.price_cents * item.quantity);
          categoryMap[categoryName].quantity += item.quantity;
        });
      } catch (e) {
        console.error("Error parsing items for order", order.id);
      }
    });

    // Sort Helper
    const sortDesc = (arr: any[], key: string) => arr.sort((a, b) => b[key] - a[key]);

    // Transform Maps to Arrays and Sort
    const topClients = Object.entries(clientMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5

    const topProducts = Object.entries(productMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const byCategory = Object.entries(categoryMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      revenue: totalRevenue,
      orders: ordersData.length,
      items: totalItems,
      byClient: topClients,
      byProduct: topProducts,
      byCategory
    };
  }, [ordersData, productsData]);

  if (isLoading) return <div className="p-8 text-center">Loading Sales Data...</div>;

  const formatMoney = (cents: number) => `LSL ${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold font-sora text-black dark:text-white">Sales Dashboard</h1>
          <Link href="/admin" className="text-sm font-medium text-[#666] dark:text-[#888]">Back to Admin</Link>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard title="Total Revenue" value={formatMoney(stats.revenue)} icon={<DollarSign />} color="text-green-600" />
          <KPICard title="Total Orders" value={stats.orders} icon={<Package />} color="text-blue-600" />
          <KPICard title="Items Sold" value={stats.items} icon={<TrendingUp />} color="text-purple-600" />
        </div>

        {/* Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* By Category */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E6E6E6] dark:border-[#333333]">
            <h2 className="text-lg font-bold font-sora mb-4">Sales by Category</h2>
            <div className="space-y-3">
              {stats.byCategory.map((cat: any) => (
                <div key={cat.name} className="flex justify-between items-center p-3 bg-[#F9F9F9] dark:bg-[#262626] rounded-lg">
                  <span className="font-medium text-black dark:text-white">{cat.name}</span>
                  <span className="font-bold text-black dark:text-white">{formatMoney(cat.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Product */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E6E6E6] dark:border-[#333333]">
            <h2 className="text-lg font-bold font-sora mb-4">Top Products</h2>
            <div className="space-y-3">
              {stats.byProduct.map((prod: any) => (
                <div key={prod.name} className="flex justify-between items-center p-3 bg-[#F9F9F9] dark:bg-[#262626] rounded-lg">
                  <div>
                    <p className="font-medium text-black dark:text-white">{prod.name}</p>
                    <p className="text-xs text-[#666]">{prod.quantity} sold</p>
                  </div>
                  <span className="font-bold text-black dark:text-white">{formatMoney(prod.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Client (Full Width) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E6E6E6] dark:border-[#333333]">
            <h2 className="text-lg font-bold font-sora mb-4">Top Clients</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E6E6E6] dark:border-[#333333]">
                    <th className="pb-3 font-bold text-[#666] dark:text-[#888]">Client Name</th>
                    <th className="pb-3 font-bold text-[#666] dark:text-[#888]">Orders</th>
                    <th className="pb-3 font-bold text-[#666] dark:text-[#888]">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byClient.map((client: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <td className="py-3 font-medium text-black dark:text-white">{client.name}</td>
                      <td className="py-3 text-black dark:text-white">{client.count}</td>
                      <td className="py-3 font-bold text-black dark:text-white">{formatMoney(client.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, color }: { title: string; value: any; icon: any; color: string }) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E6E6E6] dark:border-[#333333] flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[#666] dark:text-[#888] mb-1">{title}</p>
        <h3 className="text-2xl font-bold font-sora text-black dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 bg-gray-100 dark:bg-[#262626] rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  );
}