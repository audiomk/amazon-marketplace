"use client";

import React, { useState } from "react";
import { authenticateUser } from "@/actions/vendorActions";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"BUYER" | "VENDOR">("BUYER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await authenticateUser(email, role);

    if (response.success && response.user) {
      // Temporarily store user identity context in local storage so the header updates
      localStorage.setItem("marketplace_user", JSON.stringify(response.user));
      
      // Smart redirect: Vendors go straight to console, Buyers go shopping
      if (response.user.role === "VENDOR" || response.user.vendorProfile) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } else {
      setError(response.error || "Login failure.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-12 px-4 font-sans text-black">
      {/* Amazon Minimalist Branding Logo */}
      <div className="text-2xl font-black mb-5 tracking-tight select-none">
        amazon<span className="text-[#e77600] font-normal text-sm">.marketplace</span>
      </div>

      {/* Structured Login Box Card Container */}
      <div className="w-full max-w-[350px] border border-gray-300 rounded-sm p-6 shadow-sm h-fit bg-white">
        <h1 className="text-2xl font-normal mb-4 text-gray-950">Sign-In</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1">
              Email address
            </label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full border border-gray-400 rounded-sm px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] text-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1">
              Select Profile Role Account Type
            </label>
            <select
              value={role} onChange={(e) => setRole(e.target.value as "BUYER" | "VENDOR")}
              className="w-full border border-gray-400 rounded-sm px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#e77600] text-black bg-gray-50 cursor-pointer"
            >
              <option value="BUYER">Standard Customer (Buyer)</option>
              <option value="VENDOR">Merchant Store Owner (Vendor)</option>
            </select>
          </div>

          {error && <p className="text-xs font-semibold text-red-700">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#f0c14b] hover:bg-[#e2b13c] border border-[#a88734] text-gray-950 text-xs py-1.5 rounded-sm shadow-sm font-normal transition-colors cursor-pointer"
          >
            {loading ? "Verifying Account..." : "Continue"}
          </button>
        </form>

        <p className="text-[11px] text-gray-600 mt-4 leading-relaxed">
          By continuing, you agree to Amazon's Mock Conditions of Use and Privacy Notice.
        </p>
      </div>

      <div className="w-full max-w-[350px] flex items-center justify-between my-6">
        <hr className="w-full border-gray-300" />
        <span className="text-xs text-gray-500 whitespace-nowrap px-2">New to our platform?</span>
        <hr className="w-full border-gray-300" />
      </div>

      <div className="text-xs text-blue-700 hover:text-blue-800 hover:underline cursor-pointer">
        Select a role above and press continue to automatically sign up!
      </div>
    </div>
  );
}