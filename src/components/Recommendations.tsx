"use client";

import { useEffect, useState } from "react";
import { Star, Plus, Check } from "lucide-react"; // Added Plus and Check icons
import { useRouter } from "next/navigation";
import { getRecommendations } from "@/app/actions/getRecommendations";

interface Props {
  currentCart: any[];
  onAdd: (product: any) => void; // New function to handle adding items
}

export default function Recommendations({ currentCart, onAdd }: Props) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track which items are currently being added (for UI feedback)
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      if (currentCart.length > 0) {
        const seedProduct = currentCart[0];
        
        const result = await getRecommendations(
          seedProduct.id, 
          seedProduct.category_id
        );
        
        const cartIds = new Set(currentCart.map((item) => item.id));
        const filteredRecs = result.data?.filter(
          (item: any) => !cartIds.has(item.id)
        ) || [];

        setRecommendations(filteredRecs);
      }
      setLoading(false);
    };

    fetchRecs();
  }, [currentCart]);

  const handleAddClick = (product: any) => {
    setAddingId(product.id);
    onAdd(product); // Call the parent function
    
    // Show a quick "success" state then reset
    setTimeout(() => setAddingId(null), 1000);
  };

  if (loading || currentCart.length === 0 || recommendations.length === 0) {
    return null;
  }

  const formatPrice = (cents: number) => `LSL ${(cents / 100).toFixed(2)}`;

  return (
    <div className="mt-8 border-t border-[#E6E6E6] dark:border-[#333333] pt-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-pink-100 p-1 rounded-full">
          <Star className="text-pink-600 w-4 h-4 fill-pink-600" />
        </div>
        <h3 className="text-lg font-bold text-black dark:text-white font-sora">
          You might also like
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recommendations.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-4 bg-[#F9FAFB] dark:bg-[#262626] p-3 rounded-xl border border-[#E6E6E6] dark:border-[#333333] transition-all hover:border-pink-300 dark:hover:border-pink-700"
          >
            {/* Thumbnail */}
            <img
              src={product.image_url}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover cursor-pointer"
              onClick={() => router.push(`/shop/product/${product.id}`)}
            />
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 
                className="text-sm font-semibold text-black dark:text-white truncate cursor-pointer hover:text-pink-600 dark:hover:text-pink-400"
                onClick={() => router.push(`/shop/product/${product.id}`)}
              >
                {product.name}
              </h4>
              <p className="text-sm font-bold text-pink-600 dark:text-pink-400 font-sora">
                {formatPrice(product.price_cents)}
              </p>
            </div>

            {/* Add Button */}
            <button
              onClick={() => handleAddClick(product)}
              disabled={addingId === product.id}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                addingId === product.id 
                  ? "bg-green-500 text-white" 
                  : "bg-white dark:bg-[#1E1E1E] text-pink-600 border border-[#E6E6E6] dark:border-[#333333] hover:bg-pink-50 dark:hover:bg-pink-900/20"
              }`}
            >
              {addingId === product.id ? (
                <Check size={16} />
              ) : (
                <Plus size={16} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}