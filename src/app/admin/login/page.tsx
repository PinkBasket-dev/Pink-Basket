"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check against the environment variable (handled in middleware, 
    // but we set the cookie here)
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      // Set the cookie for 24 hours
      document.cookie = `admin_auth=${password}; path=/; max-age=86400`;
      router.push("/admin");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl shadow-lg border border-[#E6E6E6] dark:border-[#333333] w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full">
            <Lock size={32} className="text-pink-600 dark:text-pink-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-black dark:text-white font-sora mb-6">
          Admin Access
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 transition-opacity"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}