"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, AlertTriangle, Search, ArrowUp, ArrowDown, Edit } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  // Fetch all products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products-all"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      return data.products || [];
    },
  });

  // Filter logic
  const filteredProducts = productsData?.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const formatPrice = (cents: number) => `LSL ${(cents / 100).toFixed(2)}`;

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    if (stock <= reorderLevel) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { label: "In Stock", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-sora text-black dark:text-white">Inventory</h1>
            <p className="text-[#666] dark:text-[#888]">Manage stock levels and product codes.</p>
          </div>
          <Link 
            href="/admin/add-product" 
            className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            + Add Product
          </Link>
        </div>

        {/* Search & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" />
              <input
                type="text"
                placeholder="Search SKU or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-lg bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>
          
          {/* Simple KPI */}
          <div className="md:col-span-3 flex items-center justify-between bg-white dark:bg-[#1E1E1E] p-4 rounded-lg border border-[#E6E6E6] dark:border-[#333333]">
            <div className="text-center flex-1 border-r border-gray-100 dark:border-gray-800 last:border-0">
              <p className="text-xs text-[#666] dark:text-[#888] uppercase">Total Products</p>
              <p className="text-xl font-bold text-black dark:text-white">{productsData?.length || 0}</p>
            </div>
            <div className="text-center flex-1 border-r border-gray-100 dark:border-gray-800 last:border-0">
              <p className="text-xs text-[#666] dark:text-[#888] uppercase">Total Stock Value</p>
              <p className="text-xl font-bold text-black dark:text-white">
                {formatPrice((productsData?.reduce((acc: number, p: any) => acc + (p.price_cents * p.stock_quantity), 0) || 0))}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xs text-[#666] dark:text-[#888] uppercase">Low Stock Alerts</p>
              <p className="text-xl font-bold text-yellow-600">
                {productsData?.filter((p: any) => p.stock_quantity <= (p.reorder_level || 5)).length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E6E6E6] dark:border-[#333333] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F5F5F5] dark:bg-[#262626]">
                <tr>
                  <th className="p-4 text-xs font-bold text-[#666] dark:text-[#888] uppercase">Product</th>
                  <th className="p-4 text-xs font-bold text-[#666] dark:text-[#888] uppercase">SKU</th>
                  <th className="p-4 text-xs font-bold text-[#666] dark:text-[#888] uppercase">Price</th>
                  <th className="p-4 text-xs font-bold text-[#666] dark:text-[#888] uppercase">Stock</th>
                  <th className="p-4 text-xs font-bold text-[#666] dark:text-[#888] uppercase">Reorder At</th>
                  <th className="p-4 text-xs font-bold text-[#666] dark:text-[#888] uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-[#666] dark:text-[#888] uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E6] dark:divide-[#333333]">
                {isLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center">Loading...</td></tr>
                ) : (
                  filteredProducts.map((product: any) => {
                    const status = getStockStatus(product.stock_quantity, product.reorder_level || 5);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image_url} alt="" className="w-10 h-10 rounded object-cover bg-gray-200" />
                            <span className="font-medium text-black dark:text-white line-clamp-1 max-w-[150px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[#666] dark:text-[#888] font-mono">{product.sku || '-'}</td>
                        <td className="p-4 text-sm font-medium text-black dark:text-white">{formatPrice(product.price_cents)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-black dark:text-white">{product.stock_quantity}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[#666] dark:text-[#888]">{product.reorder_level || 5}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                           <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            Quick Edit {/* We can add edit logic later */}
                           </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}