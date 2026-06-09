"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define what a Cart Item profile looks like
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  vendorName?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Load preexisting cart items from the browser storage layout on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem("amazon_marketplace_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // 2. Keep the local storage row completely matching our state automatically
  const saveCartToCache = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("amazon_marketplace_cart", JSON.stringify(newCart));
  };

  const addToCart = (product: any) => {
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      saveCartToCache(updatedCart);
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        vendorName: product.vendor?.storeName || "Independent Seller",
      };
      saveCartToCache([...cart, newItem]);
    }
  };

  const removeFromCart = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    saveCartToCache(updatedCart);
  };

  const clearCart = () => {
    saveCartToCache([]);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartCount, getSubtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be executed inside a valid global CartProvider tree wrapper.");
  }
  return context;
}