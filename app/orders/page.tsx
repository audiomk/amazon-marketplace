"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { Package, Receipt, ArrowRight, ShoppingBag } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendorName: string;
}

interface HistoricalOrder {
  orderId: string;
  date: string;
  total: number;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<HistoricalOrder[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Recover active user token context
    const savedUser = localStorage.getItem("marketplace_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCurrentUserEmail(parsed.email);
      setIsAuthenticated(true);
      
      // 2. Fetch order histories partitioned strictly by this logged-in account
      const savedHistories = localStorage.getItem(`orders_history_${parsed.email}`);
      if (savedHistories) {
        setOrders(JSON.parse(savedHistories));
      }
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  // Handle unauthenticated state
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#eaeded]">
        <Header />
        <div className="max-w-md mx-auto mt-16 p-8 bg-white border border-gray-300 rounded-sm text-center shadow-sm">
          <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="font-bold text-lg text-gray-950 mb-2">Sign in to view orders</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            You need an active marketplace account to track your purchase history and invoice receipts.
          </p>
          <Link 
            href="/login" 
            className="inline-block bg-[#f0c14b] hover:bg-[#e2b13c] border border-[#a88734] text-gray-950 text-sm font-bold px-6 py-2 rounded-sm shadow-sm transition-colors"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eaeded]">
      <Header />

      <div className="max-w-4xl mx-auto p-4 mt-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:underline text-blue-700">Your Account</Link>
          <ArrowRight size={10} />
          <span className="text-gray-600 font-medium">Your Orders</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-950 mb-1">Your Orders</h1>
        <p className="text-xs text-gray-500 mb-6 font-medium">Tracking account purchases for: {currentUserEmail}</p>

        {orders.length === 0 ? (
          /* Empty Order State Graphic */
          <div className="bg-white border border-gray-300 rounded-sm p-12 text-center shadow-sm">
            <ShoppingBag size={44} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-gray-950 mb-1">You haven't placed any orders yet</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4 leading-relaxed">
              Looks like you haven't filled your delivery lines with marketplace goods. Check out our dynamic vendor feed!
            </p>
            <Link 
              href="/" 
              className="inline-block bg-[#f0c14b] hover:bg-[#e2b13c] border border-[#a88734] text-gray-950 text-xs font-medium px-4 py-1.5 rounded-sm shadow-sm transition-colors decoration-transparent"
            >
              Browse active listings
            </Link>
          </div>
        ) : (
          /* Historical Interactive Invoice Stream */
          <div className="space-y-5">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-sm border border-gray-300 shadow-sm overflow-hidden text-black">
                
                {/* Micro Meta Stripe Header */}
                <div className="bg-gray-100 p-3 border-b border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-600 font-medium">
                  <div>
                    <p className="uppercase text-[10px] font-bold text-gray-400">Order Placed</p>
                    <p className="text-gray-900 font-semibold">{order.date}</p>
                  </div>
                  <div>
                    <p className="uppercase text-[10px] font-bold text-gray-400">Total Price</p>
                    <p className="text-gray-900 font-bold">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="uppercase text-[10px] font-bold text-gray-400">Ship To</p>
                    <p className="text-blue-700 hover:underline cursor-pointer font-semibold">{currentUserEmail.split("@")[0]}</p>
                  </div>
                  <div className="sm:text-right flex flex-col sm:items-end justify-center">
                    <p className="uppercase text-[10px] font-bold text-gray-400">Invoice Id</p>
                    <p className="text-gray-700 font-mono tracking-tight text-[11px] font-semibold">#{order.orderId}</p>
                  </div>
                </div>

                {/* Line Item Products Inner Rows */}
                <div className="p-4 divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-sm overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="object-cover h-full w-full opacity-90 mix-blend-multiply" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-semibold text-gray-950 line-clamp-1 leading-tight">{item.name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                          Merchant: <span className="text-[#e77600]">{item.vendorName}</span>
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2">
                          <span className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded-sm font-semibold text-gray-700">Qty: {item.quantity}</span>
                          <span>Price: ${(item.price).toFixed(2)} each</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button className="bg-[#f0c14b] hover:bg-[#e2b13c] border border-[#a88734] font-medium text-[11px] text-gray-950 py-1 px-4 rounded-sm shadow-sm cursor-pointer transition-colors">
                          Buy It Again
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}