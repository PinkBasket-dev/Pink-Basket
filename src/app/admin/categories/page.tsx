"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (data.categories) setCategories(data.categories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName, display_order: categories.length + 1 }),
      });
      if (res.ok) {
        setNewCategoryName("");
        fetchCategories();
      } else {
        alert("Failed to add category");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure? Products in this category might need updating.")) return;
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-full">
            <ArrowLeft size={20} className="text-black dark:text-white" />
          </Link>
          <h1 className="text-3xl font-bold font-sora text-black dark:text-white">Manage Categories</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Form */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E6E6E6] dark:border-[#333333] sticky top-8">
              <h2 className="text-lg font-bold text-black dark:text-white mb-4 font-sora">Add New Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white focus:outline-none"
                  placeholder="e.g. Snacks"
                />
                <button type="submit" disabled={isLoading} className="w-full py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 disabled:opacity-50">
                  {isLoading ? "Adding..." : "Add Category"}
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E6E6E6] dark:border-[#333333] overflow-hidden">
              <div className="p-6 border-b border-[#E6E6E6] dark:border-[#333333]">
                <h2 className="text-lg font-bold text-black dark:text-white font-sora">Existing Categories</h2>
              </div>
              <div className="divide-y divide-[#E6E6E6] dark:divide-[#333333]">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                    <p className="font-medium text-black dark:text-white">{cat.name}</p>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && <p className="p-6 text-center text-[#666]">No categories found.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}