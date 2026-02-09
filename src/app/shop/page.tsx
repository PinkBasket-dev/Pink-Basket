"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Search, Plus, Minus } from "lucide-react";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory
        ? `/api/products?category_id=${selectedCategory}`
        : "/api/products";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Filter products by search
  const filteredProducts =
    productsData?.products?.filter((product: any) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  // Cart functions
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item: any) => item.id === product.id);
      if (existing) {
        return prevCart.map((item: any) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart((prevCart) => prevCart.filter((item: any) => item.id !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item: any) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0,
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (cents: number) => {
    return `LSL ${(cents / 100).toFixed(2)}`;
  };

  const goToCheckout = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "/shop/checkout";
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1E1E1E] border-b border-[#E6E6E6] dark:border-[#333333] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
<div className="flex items-center gap-3">
  <img
    src="/logo.png"
    alt="Pink Basket Logo"
    className="h-16 md:h-20 w-auto"
  />
  <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white font-sora">
    Pink Basket
  </h1>
</div>
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative hidden md:block">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-full bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter text-sm transition-all duration-200 focus:outline-none focus:border-black dark:focus:border-white"
              />
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#6E6E6E] dark:text-[#888888]"
              />
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative h-11 px-5 rounded-full bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold text-sm transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] dark:hover:from-[#F0F0F0] dark:hover:to-[#D0D0D0] active:scale-95 font-inter flex items-center gap-2"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#22C55E] dark:bg-[#40D677] text-white dark:text-black rounded-full text-xs font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="mt-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-full bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter text-sm transition-all duration-200 focus:outline-none focus:border-black dark:focus:border-white"
              />
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#6E6E6E] dark:text-[#888888]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-[#1E1E1E] border-b border-[#E6E6E6] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-150 font-inter ${
                selectedCategory === null
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-[#F5F5F5] dark:bg-[#262626] text-[#4D4D4D] dark:text-[#B0B0B0] hover:bg-[#EEEEEE] dark:hover:bg-[#2A2A2A]"
              }`}
            >
              All Products
            </button>
            {categoriesData?.categories?.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-150 font-inter ${
                  selectedCategory === category.id
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-[#F5F5F5] dark:bg-[#262626] text-[#4D4D4D] dark:text-[#B0B0B0] hover:bg-[#EEEEEE] dark:hover:bg-[#2A2A2A]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

     {/* --- HERO BANNER --- */}
<div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 md:p-12 mb-8 shadow-lg relative overflow-hidden">
  <div className="absolute inset-0 bg-black opacity-10 pointer-events-none"></div>

  <div className="relative z-10 max-w-3xl flex flex-col items-center justify-center">
    <h2 className="text-3xl md:text-5xl font-extrabold text-white font-sora mb-4 tracking-tight">
      Your Neighborhood Store.
    </h2>
    <p className="text-white/90 font-inter text-lg md:text-xl max-w-2xl">
      Get your favorite snacks, drinks, and daily essentials delivered straight to your door in Maseru.
    </p>
  </div>
</div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product: any) => (
            <div
              key={product.id}
              className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] overflow-hidden transition-all duration-150 hover:border-[#C0C0C0] dark:hover:border-[#505050] hover:scale-[1.02]"
            >
              <div className="aspect-square bg-[#F5F5F5] dark:bg-[#262626] relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm md:text-base text-black dark:text-white mb-1 font-bricolage line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-lg md:text-xl font-bold text-black dark:text-white mb-3 font-sora">
                  {formatPrice(product.price_cents)}
                </p>
                
                {/* --- STOCK LOGIC START --- */}
                {product.stock_quantity > 0 ? (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-2.5 rounded-full bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold text-sm transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] dark:hover:from-[#F0F0F0] dark:hover:to-[#D0D0D0] active:scale-95 font-inter"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold text-sm font-inter cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
                {/* --- STOCK LOGIC END --- */}

              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#6E6E6E] dark:text-[#888888] font-inter">
              No products found
            </p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white dark:bg-[#1E1E1E] shadow-2xl z-50 flex flex-col">
            <div className="p-6 border-b border-[#E6E6E6] dark:border-[#333333]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black dark:text-white font-sora">
                  Your Cart
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-[#6E6E6E] dark:text-[#888888] hover:text-black dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <p className="text-center text-[#6E6E6E] dark:text-[#888888] py-10 font-inter">
                  Your cart is empty
                </p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#262626]"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-black dark:text-white font-bricolage">
                          {item.name}
                        </h3>
                        <p className="text-base font-bold text-black dark:text-white font-sora">
                          {formatPrice(item.price_cents)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-full bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#404040] flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A]"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-semibold text-black dark:text-white font-inter">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-7 h-7 rounded-full bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#404040] flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-[#E6E6E6] dark:border-[#333333]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-black dark:text-white font-inter">
                    Subtotal
                  </span>
                  <span className="text-2xl font-bold text-black dark:text-white font-sora">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <button
                  onClick={goToCheckout}
                  className="w-full py-3.5 rounded-full bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold text-base transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] dark:hover:from-[#F0F0F0] dark:hover:to-[#D0D0D0] active:scale-95 font-inter"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}