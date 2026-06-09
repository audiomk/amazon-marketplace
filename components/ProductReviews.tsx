"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { submitProductReview } from "@/actions/vendorActions";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export default function ProductReviews({ productId, reviews = [] }: { productId: string, reviews: Review[] }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("marketplace_user") || "{}");
    if (!user.email) return alert("Please log in to review.");

    setLoading(true);
    const res = await submitProductReview(productId, rating, comment, user.email);
    setLoading(false);

    if (res.success) {
      setComment("");
      alert("Review submitted!");
      window.location.reload(); // Simple way to refresh the server component data
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-lg font-bold mb-4">Customer Reviews</h3>
      
      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-sm border mb-6">
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              size={20} 
              className={`cursor-pointer ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
              onClick={() => setRating(star)} 
            />
          ))}
        </div>
        <textarea 
          className="w-full p-2 border rounded-sm mb-2 text-sm"
          placeholder="Share your thoughts on this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-[#f0c14b] px-4 py-1 text-xs font-bold rounded-sm border hover:bg-[#e2b13c]"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {/* Display Existing Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? <p className="text-sm text-gray-500">No reviews yet.</p> : reviews.map((rev) => (
          <div key={rev.id} className="border-b pb-4">
            <div className="flex gap-1 mb-1">
              {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-sm text-gray-700">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}