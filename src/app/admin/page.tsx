import Link from 'next/link';
import { Package, ShoppingCart, List, ArrowLeft } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold font-sora text-black dark:text-white">
            Pink Basket Admin
          </h1>
          <Link 
            href="/shop"
            className="flex items-center gap-2 text-sm font-medium text-[#666] dark:text-[#888] hover:text-black dark:hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Add Product */}
          <Link href="/admin/add-product" className="group">
            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E6E6E6] dark:border-[#333333] shadow-sm hover:shadow-md transition-all duration-200 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-600 dark:text-pink-400">
                  <Package size={24} />
                </div>
                <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">→</span>
              </div>
              <h2 className="text-xl font-bold text-black dark:text-white mb-2 font-sora">
                Add Product
              </h2>
              <p className="text-sm text-[#666] dark:text-[#888]">
                Upload images and list new items.
              </p>
            </div>
          </Link>

          {/* Card 2: View Orders */}
          <Link href="/admin/orders" className="group">
            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E6E6E6] dark:border-[#333333] shadow-sm hover:shadow-md transition-all duration-200 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                  <ShoppingCart size={24} />
                </div>
                <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">→</span>
              </div>
              <h2 className="text-xl font-bold text-black dark:text-white mb-2 font-sora">
                View Orders
              </h2>
              <p className="text-sm text-[#666] dark:text-[#888]">
                Manage incoming customer orders.
              </p>
            </div>
          </Link>

          {/* Card 3: Categories */}
          <Link href="/admin/categories" className="group">
            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E6E6E6] dark:border-[#333333] shadow-sm hover:shadow-md transition-all duration-200 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                  <List size={24} />
                </div>
                <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">→</span>
              </div>
              <h2 className="text-xl font-bold text-black dark:text-white mb-2 font-sora">
                Categories
              </h2>
              <p className="text-sm text-[#666] dark:text-[#888]">
                Create and organize categories.
              </p>
            </div>
          </Link>

          {/* Add this to your grid in admin/page.tsx */}

          <Link href="/admin/sales" className="group">
            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E6E6E6] dark:border-[#333333] shadow-sm hover:shadow-md transition-all duration-200 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                  <svg xmlns="trendinup" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
               <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">→</span>
             </div>
             <h2 className="text-xl font-bold text-black dark:text-white mb-2 font-sora">
               Sales Dashboard
             </h2>
             <p className="text-sm text-[#666] dark:text-[#888]">
               View revenue, top clients, and products.
             </p>
           </div>
        </Link>
        
        </div>
      </div>
    </div>
  );
}