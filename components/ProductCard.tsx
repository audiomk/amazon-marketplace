"use client";

import React from "react";
import { useCart } from "@/components/CartContext";
import { ShoppingCart, Store, Star } from "lucide-react"; // Added Star
import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    countInStock: number;
    vendorId: string;
    vendor?: {
      storeName: string;
    };
    reviews?: { rating: number }[]; // Added reviews
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  // Calculate average rating
  const averageRating = product.reviews && product.reviews.length > 0 
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
    : 0;

  const handleAddToCart = () => {
    if (product.countInStock <= 0) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      vendorName: product.vendor?.storeName || "Independent Merchant",
      quantity: 1,
    });
  };

  const fallBackImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

  return (
    <div className="bg-white rounded-sm border border-gray-300 shadow-sm overflow-hidden flex flex-col justify-between p-4 group hover:shadow-md transition-shadow duration-200">
      <Link 
        href={`/product/${product.id}`}
        className="w-full h-44 flex items-center justify-center bg-gray-50 rounded-sm overflow-hidden mb-3 border border-gray-100 relative cursor-pointer block"
      >
        <img
          src={product.image || fallBackImage}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 mix-blend-multiply opacity-90"
        />
        {product.countInStock <= 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
              Temporarily Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex-grow flex flex-col justify-between space-y-2">
        <div>
          <Link 
            href={`/product/${product.id}`}
            className="text-sm font-semibold text-gray-950 line-clamp-2 leading-snug hover:text-[#e77600] transition-colors cursor-pointer decoration-transparent block"
          >
            {product.name}
          </Link>

          {/* Star Rating Display */}
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={12} 
                className={star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
              />
            ))}
            <span className="text-[10px] text-gray-500 ml-1">({product.reviews?.length || 0})</span>
          </div>
          
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-1">
            <Store size={12} className="text-gray-400" />
            <span>Sold by: </span>
            <Link 
              href={`/store/${product.vendorId}`}
              className="text-[#e77600] font-extrabold hover:underline cursor-pointer decoration-transparent"
            >
              {product.vendor?.storeName || "Global Merchant"}
            </Link>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-gray-950 align-top">$</span>
            <span className="text-xl font-extrabold text-gray-950">
              {Math.floor(product.price)}
            </span>
            <span className="text-xs font-bold text-gray-950 align-top">
              {(product.price % 1).toFixed(2).substring(1)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.countInStock <= 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs shadow-sm transition-colors cursor-pointer border ${
              product.countInStock > 0
                ? "bg-[#ffd814] hover:bg-[#f7ca00] border-[#fcd200] text-gray-950"
                : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            <ShoppingCart size={13} />
            <span>{product.countInStock > 0 ? "Add" : "Empty"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}