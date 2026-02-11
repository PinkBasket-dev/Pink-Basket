"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Upload, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  
  // --- FETCH CATEGORIES ---
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      return data.categories || []; // Important: Unpack the array here
    },
  });
  // ----------------------
  
  const [formData, setFormData] = useState({
    name: "",
    price_cents: "",
    category_id: "",
    description: "",
    sku: "",
    stock_quantity: "",
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.error) {
          alert(data.error);
          router.push("/admin/inventory");
          return;
        }
        
        setFormData({
          name: data.name,
          price_cents: (data.price_cents / 100).toFixed(2),
          category_id: data.category_id.toString(),
          description: data.description || "",
          sku: data.sku || "",
          stock_quantity: data.stock_quantity.toString(),
        });
        setExistingImageUrl(data.image_url);
        setImagePreview(data.image_url);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    
    if (id) fetchProduct();
  }, [id, router]);

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
    setIsSaving(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("price_cents", formData.price_cents);
      dataToSend.append("category_id", formData.category_id);
      dataToSend.append("description", formData.description);
      dataToSend.append("sku", formData.sku);
      dataToSend.append("stock_quantity", formData.stock_quantity);
      dataToSend.append("existing_image_url", existingImageUrl); 
      if (imageFile) dataToSend.append("image", imageFile);

      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: dataToSend,
      });

      if (!response.ok) throw new Error("Failed to update product");

      alert("Product Updated Successfully!");
      router.push("/admin/inventory");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading product data...</div>;

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
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold text-black dark:text-white font-sora">
            Edit Product
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E6E6E6] dark:border-[#333333] p-6 md:p-8 space-y-6 shadow-sm">
          
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-black dark:text-white font-inter">Product Image</label>
            <div className="relative group">
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`border-2 border-dashed ${imagePreview ? 'border-transparent' : 'border-[#E5E5E5] dark:border-[#404040]'} rounded-xl overflow-hidden bg-[#F5F5F5] dark:bg-[#262626] h-64 flex flex-col items-center justify-center text-center transition-all`}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-sm text-[#666] dark:text-[#888]">Click to change image</p>
                )}
              </div>
            </div>
          </div>

          {/* Name & SKU Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black dark:text-white font-inter">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white" required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black dark:text-white font-inter">SKU (Optional)</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-black dark:text-white font-inter">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white" placeholder="Enter product description..." />
          </div>

          {/* Price, Category, Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black dark:text-white font-inter">Price (LSL)</label>
              <input type="number" name="price_cents" value={formData.price_cents} onChange={handleChange} step="0.01" className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white" required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black dark:text-white font-inter">Category</label>
              <select name="category_id" value={formData.category_id} onChange={(e) => handleChange(e as any)} className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white" required>
                <option value="">Select Category</option>
                {isCategoriesLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  categoriesData?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black dark:text-white font-inter">Stock Qty</label>
              <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white" required />
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 disabled:opacity-50">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}