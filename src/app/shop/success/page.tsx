import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E1E1E] max-w-md w-full p-8 rounded-3xl shadow-lg border border-[#E6E6E6] dark:border-[#333333] text-center">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle size={64} className="text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold font-sora text-black dark:text-white mb-2">
          Order Placed!
        </h1>
        <p className="text-[#666] dark:text-[#888] mb-8">
          Thank you for your purchase. We have received your order and it is being processed.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            href="/shop"
            className="flex items-center justify-center w-full py-3.5 rounded-full bg-gradient-to-b from-[#252525] to-[#0F0F0F] dark:from-[#FFFFFF] dark:to-[#E0E0E0] text-white dark:text-black font-semibold text-base transition-all duration-150 hover:opacity-90 hover:scale-[1.02]"
          >
            <ShoppingBag size={20} className="mr-2" />
            Continue Shopping
          </Link>

          <Link 
            href="/"
            className="flex items-center justify-center w-full py-3.5 rounded-full bg-transparent border border-[#E6E6E6] dark:border-[#404040] text-[#666] dark:text-[#888] font-medium text-sm transition-all hover:bg-gray-50 dark:hover:bg-[#262626]"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}