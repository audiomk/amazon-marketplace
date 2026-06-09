"use client";

import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import Link from 'next/link';
import { useCart } from "@/components/CartContext"; // Hook up global cart tracking
import { useRouter, useSearchParams } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const { getCartCount } = useCart(); // Extract live counter value
  
  const router = useRouter();
  const searchParams = useSearchParams();
  // Sync your local search state with the current active URL parameters
  const [localSearch, setLocalSearch] = useState(searchParams?.get("search") || "");

  useEffect(() => {
    // Read the current authenticated browser user session if available
    const savedUser = localStorage.getItem("marketplace_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Update input text if URL parameters change externally
  useEffect(() => {
    setLocalSearch(searchParams?.get("search") || "");
  }, [searchParams]);

  const handleSignOut = () => {
    localStorage.removeItem("marketplace_user");
    setUser(null);
    window.location.reload();
  };

  const executeSearchQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/?search=${encodeURIComponent(localSearch.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header className="flex flex-col w-full font-sans select-none">
      {/* Dark Main Header Bar */}
      <div className="bg-[#131921] text-white px-4 py-2 flex items-center justify-between gap-4 h-14">
        
        {/* Marketplace Logo Branding */}
        <Link href="/" className="text-xl font-bold px-2 py-1 border border-transparent hover:border-white rounded-sm cursor-pointer flex items-center text-white decoration-transparent">
          amazon<span className="text-[#febd69] font-normal text-sm pt-1">.marketplace</span>
        </Link>

        {/* Global Structural Search Field Component */}
        <form 
          onSubmit={executeSearchQuery}
          className="flex flex-1 max-w-3xl h-10 rounded-md overflow-hidden bg-[#febd69] hover:bg-[#f3a847] focus-within:ring-2 focus-within:ring-[#e77600] transition-all"
        >
          <select className="bg-gray-100 text-gray-700 text-xs px-3 border-r border-gray-300 outline-none h-full cursor-pointer rounded-l-md">
            <option>All Departments</option>
          </select>
          <input 
            type="text" 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-grow outline-none px-3 text-black text-sm h-full bg-white placeholder-gray-400"
            placeholder="Search products by title or merchant name..."
          />
          <button 
            type="submit"
            className="w-12 h-full flex items-center justify-center text-gray-800 hover:text-black cursor-pointer bg-transparent border-none"
          >
            <Search size={20} />
          </button>
        </form>

        {/* Account and Cart Controls */}
        <div className="flex items-center gap-1 text-sm">
          {user ? (
            <div onClick={handleSignOut} className="px-2 py-1 border border-transparent hover:border-white rounded-sm cursor-pointer flex flex-col justify-center leading-tight h-10">
              <span className="text-xs text-gray-300">Hello, {user.email.split('@')[0]}</span>
              <span className="font-extrabold text-xs text-[#febd69]">Sign Out</span>
            </div>
          ) : (
            <Link href="/login" className="px-2 py-1 border border-transparent hover:border-white rounded-sm cursor-pointer flex flex-col justify-center leading-tight h-10 text-white decoration-transparent">
              <span className="text-xs text-gray-200">Hello, Sign in</span>
              <span className="font-extrabold text-sm">Account & Lists</span>
            </Link>
          )}

          {/* Dynamically Routed, Live-Updating Shopping Cart Link */}
          <Link href="/cart" className="flex items-center px-2 py-1 border border-transparent hover:border-white rounded-sm cursor-pointer relative h-10 text-white decoration-transparent">
            <ShoppingCart size={26} />
            <span className="absolute -top-1 left-5 bg-[#131921] text-[#f3a847] text-xs font-bold px-1 rounded-full min-w-[16px] text-center">
              {getCartCount()}
            </span>
            <span className="font-extrabold text-sm mt-3 ml-1 hidden md:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* Navy Sub-Header Utility Belt */}
      <div className="bg-[#232f3e] text-white px-4 py-1.5 flex items-center gap-4 text-xs font-semibold shadow-sm">
        <div className="flex items-center gap-1 px-2 py-0.5 border border-transparent hover:border-white rounded-sm cursor-pointer">
          <Menu size={16} /> All
        </div>
        <p className="px-2 py-0.5 border border-transparent hover:border-white rounded-sm cursor-pointer">Today's Deals</p>
        
        {/* Step 54 Integration: Live Orders Log Link Routing */}
        <Link href="/orders" className="px-2 py-0.5 border border-transparent hover:border-white rounded-sm cursor-pointer text-white decoration-transparent">
          Orders
        </Link>
        
        {user?.role === "VENDOR" || user?.vendorProfile ? (
          <Link href="/dashboard" className="px-2 py-0.5 border border-transparent hover:border-white rounded-sm cursor-pointer text-[#febd69] font-bold decoration-transparent">
            Merchant Console
          </Link>
        ) : (
          <Link href="/become-seller" className="px-2 py-0.5 border border-transparent hover:border-white rounded-sm cursor-pointer text-[#febd69] font-bold decoration-transparent">
            Become a Seller
          </Link>
        )}
      </div>
    </header>
  );
}