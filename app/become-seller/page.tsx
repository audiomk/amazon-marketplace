"use client";

import { registerVendorStore } from "@/actions/vendorActions";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Store, ShieldCheck, Rocket, AlertTriangle } from "lucide-react";

export default function BecomeSellerPage() {
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  // 1. Extract the active user email address on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("marketplace_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCurrentUserEmail(parsed.email);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!currentUserEmail) {
      setMessage({ type: "error", text: "You must be signed in to register a storefront." });
      setLoading(false);
      return;
    }

    // 2. Pass all 3 required arguments to your server action securely
    const response = await registerVendorStore(storeName, description, currentUserEmail);

    if (response.success) {
      setMessage({ 
        type: "success", 
        text: `Congratulations! "${storeName}" has been successfully launched in your marketplace database.` 
      });
      setStoreName("");
      setDescription("");
    } else {
      setMessage({ 
        type: "error", 
        text: response.error || "An unexpected system configuration error occurred." 
      });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#eaeded]">
      <Header />

      <div className="max-w-5xl mx-auto p-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Onboarding Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-sm border border-gray-300 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
            <Store className="text-[#e77600]" size={28} />
            <h1 className="text-2xl font-bold text-gray-950">Register Your Storefront</h1>
          </div>
          
          <p className="text-gray-600 text-xs mb-6">
            Join thousands of merchants selling on our marketplace platform. Fill out your public merchant profile details below to unlock your seller inventory dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Marketplace Store Name
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g., Galaxy Tech Electronics"
                className="w-full border border-gray-400 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] text-black bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Store Description <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell your shoppers what you specialize in selling..."
                className="w-full border border-gray-400 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] text-black bg-white"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-sm flex items-center gap-2 text-sm font-medium border ${
                message.type === "success" 
                  ? "bg-green-50 border-green-300 text-green-800" 
                  : "bg-red-50 border-red-300 text-red-800"
              }`}>
                {message.type === "error" && <AlertTriangle size={18} />}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f0c14b] hover:bg-[#e2b13c] border border-[#a88734] text-gray-950 font-medium py-2 rounded-sm shadow-sm text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Creating Storefront..." : "Launch Storefront"}
            </button>
          </form>
        </div>

        {/* Right Column: Information Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#fff] p-4 rounded-sm border border-gray-300 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 mb-2">
              <ShieldCheck className="text-green-600" size={18} /> Seller Protection
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every checkout translation is monitored and protected. We securely handle payment split management transactions automatically.
            </p>
          </div>

          <div className="bg-[#fff] p-4 rounded-sm border border-gray-300 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 mb-2">
              <Rocket className="text-blue-600" size={18} /> Multi-Vendor Access
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Once verified, your dashboard allows complete catalog mapping controls, inventory counts adjustments, and secure customer billing tracking.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}