"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, User, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  // function CheckoutPage() { 
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  // 1. Calculate Totals 
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0
  );
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const formatPrice = (cents: number) => `LSL ${(cents / 100).toFixed(2)}`;

  // 2. Load Cart
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      router.replace("/shop");
    }
  }, [router]);

  // 3. Handle Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. Handle Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          total_cents: cartTotal,
          items: cart,
        }),
      });

      if (!response.ok) throw new Error("Failed to place order");

      // Success!
      localStorage.removeItem("cart");
      router.push("/shop/success");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- return ---
  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1E1E1E] border-b border-[#E6E6E6] dark:border-[#333333] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-[#4D4D4D] dark:text-[#B0B0B0] hover:text-black dark:hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-black dark:text-white font-sora">
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: Delivery Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-black dark:text-white font-sora mb-6 flex items-center gap-2">
              <MapPin size={20} />
              Delivery Information
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#6E6E6E] dark:text-[#888888] mb-1 font-inter">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] dark:text-[#666666]" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter text-sm focus:outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[#6E6E6E] dark:text-[#888888] mb-1 font-inter">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] dark:text-[#666666]" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+266 123 4567"
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter text-sm focus:outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-[#6E6E6E] dark:text-[#888888] mb-1 font-inter">
                  Delivery Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street, Maseru"
                  className="w-full p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white placeholder-[#6E6E6E] dark:placeholder-[#888888] font-inter text-sm focus:outline-none focus:border-black dark:focus:border-white h-24 resize-none"
                  required
                />
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-black dark:text-white font-sora mb-4">
              Order Summary ({itemCount} items)
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto mb-6 pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-[#F5F5F5] dark:bg-[#262626]"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-black dark:text-white line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#6E6E6E] dark:text-[#888888]">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-black dark:text-white font-sora mt-1">
                      {formatPrice(item.price_cents * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E6E6E6] dark:border-[#333333] pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-semibold text-black dark:text-white font-inter">
                  Total
                </span>
                <span className="text-2xl font-bold text-black dark:text-white font-sora">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-full bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold text-base transition-all duration-150 hover:from-[#2d2d2d] hover:to-[#171717] dark:hover:from-[#F0F0F0] dark:hover:to-[#D0D0D0] active:scale-95 font-inter flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CreditCard size={18} />
                {isProcessing ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
