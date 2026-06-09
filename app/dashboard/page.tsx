"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth"; // Hook up the security guard
import { createVendorProduct, getVendorDashboardStats } from "@/actions/vendorActions";
import { PackagePlus, Coins, Layers, CheckCircle, Package } from "lucide-react";

export default function VendorDashboard() {
  // 1. Enforce Auth Guard
  const { user, loading: authLoading } = useAuth();
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [storeName, setStoreName] = useState<string>("");
  const [payoutTotal, setPayoutTotal] = useState<number>(0);

  // 2. Fetch active products along with profile context fields
  const refreshInventory = async () => {
    if (!user?.email) return;
    const res = await getVendorDashboardStats(user.email);
    if (res.success && res.products) {
      setProducts(res.products);
      if (res.storeName) setStoreName(res.storeName);
    }
  };

  useEffect(() => {
    if (user?.email) {
      refreshInventory();
      const savedPayouts = localStorage.getItem("vendor_lifetime_payouts") || "0";
      setPayoutTotal(parseFloat(savedPayouts));
    }
  }, [user]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    
    setLoading(true);
    setSuccess(false);

    const response = await createVendorProduct(name, Number(price), "", Number(stock), user.email);

    if (response.success) {
      setSuccess(true);
      setName("");
      setPrice("");
      setStock("");
      await refreshInventory();
    } else {
      alert(response.error || "System failure listing inventory.");
    }
    setLoading(false);
  };

  // 3. Handle auth states
  if (authLoading) return <main className="min-h-screen bg-[#eaeded] p-12 text-center text-sm">Authenticating merchant session...</main>;
  if (!user) return null; // Hook handles redirect

  return (
    <main className="min-h-screen bg-[#eaeded]">
      <Header />
      
      <div className="max-w-6xl mx-auto p-4 mt-6">
        <h1 className="text-2xl font-bold text-gray-950 mb-1">
          {storeName ? `${storeName} Storefront Console` : "Merchant Operations Console"}
        </h1>
        <p className="text-xs text-gray-500 mb-6 font-medium">Logged in profile: {user.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Inventory Submission Panel */}
          <div className="bg-white p-5 rounded-sm border border-gray-300 shadow-sm h-fit">
            <h3 className="font-bold text-base text-gray-950 flex items-center gap-2 border-b pb-3 mb-4">
              <PackagePlus size={20} className="text-[#e77600]" /> Add New Marketplace Inventory
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">Product Title</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Wireless Noise-Cancelling Headphones"
                  className="w-full border border-gray-400 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-[#e77600] text-black bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Price (USD)</label>
                  <input 
                    type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="99.99"
                    className="w-full border border-gray-400 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-[#e77600] text-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Quantity in Stock</label>
                  <input 
                    type="number" required value={stock} onChange={(e) => setStock(e.target.value)}
                    placeholder="15"
                    className="w-full border border-gray-400 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-[#e77600] text-black bg-white"
                  />
                </div>
              </div>

              {success && (
                <div className="p-2.5 bg-green-50 border border-green-300 text-green-800 text-xs font-semibold rounded-sm flex items-center gap-1.5">
                  <CheckCircle size={16} /> Item indexed successfully. Stock levels updated!
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-[#f0c14b] hover:bg-[#e2b13c] border border-[#a88734] text-gray-950 font-medium py-2 rounded-sm text-xs shadow-sm transition-colors cursor-pointer"
              >
                {loading ? "Processing Listing..." : "Publish Item Live"}
              </button>
            </form>
          </div>

          {/* Right Column: Dynamic Database Inventory Tree */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-[#e77600] rounded-sm"><Coins size={24} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Gross Store Payouts</p>
                  <p className="text-xl font-extrabold text-gray-950">${payoutTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-sm"><Layers size={24} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Active Catalog Items</p>
                  <p className="text-xl font-extrabold text-gray-950">{products.length} Items</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-sm border border-gray-300 shadow-sm">
              <h3 className="font-bold text-sm text-gray-950 mb-3">Live Active Store Listings</h3>
              {products.length === 0 ? (
                <p className="text-xs text-gray-500">No active products found for this merchant account profile yet.</p>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold">
                        <th className="p-3">Product Info</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock Units</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-black">
                      {products.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="p-3 font-medium flex items-center gap-2 text-gray-900">
                            <Package size={14} className="text-gray-400" />
                            {item.name}
                          </td>
                          <td className="p-3 font-bold text-gray-950">${item.price.toFixed(2)}</td>
                          <td className="p-3 text-gray-600">{item.countInStock} available</td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] ${
                              item.countInStock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {item.countInStock > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}