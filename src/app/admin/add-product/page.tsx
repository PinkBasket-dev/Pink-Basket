"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Upload, ArrowLeft, Save } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  
  // --- FETCH CATEGORIES ---
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      return data.categories || [];
    },
  });
  // ----------------------

  const [formData, setFormData] = useState({
    name: "",
    price_cents: "",
    category_id: "",
    description: "",
    stock_quantity: "10", // Default stock
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("price_cents", formData.price_cents);
      dataToSend.append("category_id", formData.category_id);
      dataToSend.append("stock_quantity", formData.stock_quantity);
      if (imageFile) dataToSend.append("image", imageFile);

      const response = await fetch("/api/products", {
        method: "POST",
        body: dataToSend,
      });

      if (!response.ok) throw new Error("Failed to add product");

      alert("Product Added Successfully!");
      router.push("/shop");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1E1E1E] border-b border-[#E6E6E6] dark:border-[#333333] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#4D4D4D] dark:text-[#B0B0B0] hover:text-black dark:hover:text-white transition-colors font-inter"
          >
            <ArrowLeft size={20} />
            <span>Back to Shop</span>
          </button>
          <h1 className="text-xl font-bold text-black dark:text-white font-sora">
            Add New Product
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E6E6E6] dark:border-[#333333] p-6 md:p-8 space-y-6 shadow-sm">
          
          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-black dark:text-white font-inter">
              Product Image
            </label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
              />
              <div className={`border-2 border-dashed ${imagePreview ? 'border-transparent' : 'border-[#E5E5E5] dark:border-[#404040]'} rounded-xl overflow-hidden bg-[#F5F5F5] dark:bg-[#262626] h-64 flex flex-col items-center justify-center text-center transition-all`}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#E5E5E5] dark:bg-[#404040] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="text-[#6E6E6E] dark:text-[#888888]" size={24} />
                    </div>
                    <p className="text-sm font-medium text-black dark:text-white font-inter">
                      Click to upload image
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-black dark:text-white font-inter">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Salt & Vinegar Chips"
              className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              required
            />
          </div>

          {/* Price, Category and Stock Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black dark:text-white font-inter">
                Price (LSL)
              </label>
              <input
                type="number"
                name="price_cents"
                value={formData.price_cents}
                onChange={handleChange}
                placeholder="20.00"
                step="0.01"
                className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black dark:text-white font-inter">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={(e) => handleChange(e as any)}
                className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                required
              >
                <option value="">Select Category</option>
                {isCategoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categoriesData?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black dark:text-white font-inter">
                Stock Qty
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                placeholder="10"
                className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#E6E6E6] dark:border-[#333333]">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3.5 rounded-full bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold text-base transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] dark:hover:from-[#F0F0F0] dark:hover:to-[#D0D0D0] active:scale-95 font-inter flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? "Saving..." : (
                <>
                  <Save size={18} />
                  <span>Add Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}