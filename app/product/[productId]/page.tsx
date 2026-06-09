"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "@/actions/vendorActions";
import { useCart } from "@/components/CartContext";
import Header from "@/components/Header";
import ProductReviews from "@/components/ProductReviews";
import { ShoppingCart, CheckCircle, ArrowLeft, Store, Truck, ShieldCheck } from "lucide-react";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      const data = await getProductById(productId as string);
      setProduct(data);
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  if (loading) return <main className="min-h-screen p-12 text-center">Loading product...</main>;
  if (!product) return <main className="p-12 text-center">Product not found.</main>;

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-xs text-gray-600 mb-6 hover:underline">
          <ArrowLeft size={14} /> Back
        </button>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Hero Media */}
          <div className="md:col-span-5 bg-gray-50 p-6 flex items-center justify-center">
            <img src={product.image} alt={product.name} className="max-h-[400px] mix-blend-multiply" />
          </div>

          {/* Info */}
          <div className="md:col-span-4 space-y-4">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-3xl font-extrabold">${product.price}</p>
            <p className="text-gray-600">{product.description || "No description provided."}</p>
          </div>

          {/* Checkout Widget */}
          <div className="md:col-span-3 border p-4 space-y-4">
            <button
              onClick={() => {
                addToCart({ ...product, quantity, vendorName: product.vendor?.storeName });
                setAddedMessage(true);
              }}
              className="w-full bg-[#ffd814] py-2 rounded-full text-xs font-bold"
            >
              Add to Cart
            </button>
            {addedMessage && <p className="text-green-700 text-xs">Added to cart!</p>}
          </div>
        </div>

        {/* Reviews Integration */}
        <ProductReviews productId={product.id} reviews={product.reviews} />
      </div>
    </main>
  );
}