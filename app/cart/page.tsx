"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { useCart } from "@/components/CartContext";
import { processMarketplaceCheckout } from "@/actions/vendorActions"; 
import Link from "next/link";
import { ShoppingBag, Trash2, CheckCircle, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, getSubtotal, getCartCount } = useCart();
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(""); // Added state to track generated ID

  const handleCheckout = async () => {
    if (cart.length === 0 || loading) return;
    
    setLoading(true);
    try {
      const payload = cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await processMarketplaceCheckout(payload);

      if (response.success) {
        const currentTotal = getSubtotal();
        const generatedOrderId = Math.random().toString(36).substring(2, 11).toUpperCase();

        const priorPayouts = parseFloat(localStorage.getItem("vendor_lifetime_payouts") || "0");
        localStorage.setItem("vendor_lifetime_payouts", (priorPayouts + currentTotal).toString());

        const savedUser = localStorage.getItem("marketplace_user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const historyKey = `orders_history_${parsedUser.email}`;
          const existingOrders = JSON.parse(localStorage.getItem(historyKey) || "[]");
          
          const newOrderReceipt = {
            orderId: generatedOrderId,
            date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            total: currentTotal,
            items: cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              vendorName: item.vendorName
            }))
          };

          localStorage.setItem(historyKey, JSON.stringify([newOrderReceipt, ...existingOrders]));
        }

        setOrderId(generatedOrderId); // Set the ID for the UI
        setCheckoutComplete(true);
        clearCart();
      } else {
        alert(response.error || "Order fulfillment pipeline processing error.");
      }
    } catch (error) {
      console.error("Fulfillment checkout pipeline crashed:", error);
      alert("A system configuration network issue occurred. Please check database connectivity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eaeded]">
      <Header />

      <div className="max-w-6xl mx-auto p-4 mt-6">
        {checkoutComplete ? (
          /* Post-Purchase Order Success Alert Frame */
          <div className="bg-white p-8 rounded-sm border border-gray-300 shadow-sm text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
              <CheckCircle size={36} />
            </div>
            <h1 className="text-2xl font-bold text-gray-950 mb-2">Thank you! Your order is placed.</h1>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Order ID: <span className="font-mono font-bold text-gray-900">{orderId}</span>
              <br />
              Our split-payment gateway system has successfully notified each independent vendor profile to begin packing your items.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-[#f0c14b] hover:bg-[#e2b13c] border border-[#a88734] text-gray-950 text-sm font-medium px-6 py-2 rounded-sm shadow-sm transition-colors decoration-transparent"
            >
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        ) : (
          /* Main Interactive Cart Row Blueprint Grid */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            <div className="lg:col-span-3 bg-white p-5 rounded-sm border border-gray-300 shadow-sm">
              {/* ... existing cart item display logic remains unchanged ... */}
              <div className="flex items-baseline justify-between border-b border-gray-200 pb-3 mb-4">
                <h1 className="text-2xl font-semibold text-gray-950">Shopping Cart</h1>
                <span className="text-xs text-gray-500 font-medium">Price</span>
              </div>
              
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-4">Your Amazon Marketplace basket is completely empty.</p>
                  <Link href="/" className="text-xs text-blue-700 font-bold hover:underline">Go catalog browsing now</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4 items-start text-black">
                      <div className="w-24 h-24 bg-gray-50 rounded-sm border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full opacity-90 mix-blend-multiply" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-sm text-gray-950">{item.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Sold by: {item.vendorName}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-blue-700 text-xs mt-2 hover:underline">Delete</button>
                      </div>
                      <div className="text-right font-bold text-sm text-gray-950">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-sm border border-gray-300 shadow-sm space-y-4">
              <button
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] text-gray-950 font-medium py-2 rounded-full text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Processing Order..." : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}