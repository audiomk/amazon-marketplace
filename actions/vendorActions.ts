"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function registerVendorStore(storeName: string, description: string, userEmail: string) {
  try {
    if (!userEmail) {
      return { success: false, error: "Authentication missing. Please sign in to register a store." };
    }

    // 1. Defend against empty strings or accidental spaces
    if (!storeName || storeName.trim().length < 3) {
      return { success: false, error: "Store name must be at least 3 characters long." };
    }

    // 2. Query the database blueprint to check if the store name is already claimed
    const existingStore = await prisma.vendor.findUnique({
      where: { storeName: storeName.trim() },
    });

    if (existingStore) {
      return { success: false, error: "This merchant store name is already taken." };
    }

    // 3. Locate the exact user currently session-authenticated in the browser
    let primaryUser = await prisma.user.findUnique({
      where: { email: userEmail.trim().toLowerCase() }
    });
    
    if (!primaryUser) {
      return { success: false, error: "User profile record not found." };
    }

    // 4. Atomic Transaction: Build the storefront and upgrade the user role simultaneously
    await prisma.$transaction([
      prisma.vendor.create({
        data: {
          storeName: storeName.trim(),
          userId: primaryUser.id,
        },
      }),
      prisma.user.update({
        where: { id: primaryUser.id },
        data: { role: "VENDOR" },
      }),
    ]);

    // 5. Purge the framework cache layer to make sure the navigation updates immediately
    revalidatePath("/");
    return { success: true };

  } catch (error) {
    console.error("Store creation system error:", error);
    return { success: false, error: "Database registration failure. Please check your config links." };
  }
}

export async function createVendorProduct(
  name: string, 
  price: number, 
  image: string, 
  countInStock: number,
  userEmail: string
) {
  try {
    if (!userEmail) {
      return { success: false, error: "Authentication missing. Please sign in again." };
    }

    // 1. Locate the exact user currently interacting with the interface
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail.trim().toLowerCase() },
      include: { vendorProfile: true }
    });

    if (!currentUser || !currentUser.vendorProfile) {
      return { success: false, error: "Access denied. You must register a storefront first." };
    }

    // 2. Validate form inputs safely
    if (!name.trim() || price <= 0 || countInStock < 0) {
      return { success: false, error: "Please provide valid product pricing and details." };
    }

    // 3. Insert the item directly into the product model linked to this specific vendor
    await prisma.product.create({
      data: {
        name: name.trim(),
        price: parseFloat(price.toString()),
        image: image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        countInStock: parseInt(countInStock.toString()),
        vendorId: currentUser.vendorProfile.id,
      }
    });

    // 4. Force Next.js to purge layout trees so the stock and main feed display live changes
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error("Product creation failure:", error);
    return { success: false, error: "Failed to list item in the marketplace index." };
  }
}

export async function getVendorProducts(userEmail: string) {
  try {
    if (!userEmail) return { success: true, products: [] };

    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail.trim().toLowerCase() },
      include: { vendorProfile: true }
    });

    if (!currentUser || !currentUser.vendorProfile) {
      return { success: true, products: [] };
    }

    // Pull only listings belonging strictly to this specific logged-in vendor
    const products = await prisma.product.findMany({
      where: { vendorId: currentUser.vendorProfile.id },
      orderBy: { id: "desc" }
    });

    return { success: true, products };
  } catch (error) {
    console.error("Failed to fetch merchant catalog:", error);
    return { success: false, products: [], error: "Could not sync active catalog." };
  }
}

export async function getAllMarketplaceProducts() {
  try {
    // Fetch every product and include its vendor storefront identity context
    const products = await prisma.product.findMany({
      include: {
        vendor: true,
      },
      orderBy: { id: "desc" },
    });
    return { success: true, products };
  } catch (error) {
    console.error("Global catalog fetch failure:", error);
    return { success: false, products: [] };
  }
}

export async function authenticateUser(email: string, roleInput: "BUYER" | "VENDOR") {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // 1. Check if the user already exists in our Neon database
    let user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { vendorProfile: true }
    });

    // 2. If they don't exist, create a clean account record for them automatically
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.trim().toLowerCase(),
          password: "demo_hash_no_auth_needed_yet",
          role: roleInput
        },
        include: { vendorProfile: true }
      });
    }

    return { success: true, user };
  } catch (error) {
    console.error("Auth process failure:", error);
    return { success: false, error: "Authentication pipeline failed." };
  }
}

export async function processMarketplaceCheckout(
  cartItems: { id: string; quantity: number; price: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Cannot checkout an empty shopping cart." };
    }

    // 1. Fetch all products in the cart in a single fast request to prevent serverless connection timeouts
    const productIds = cartItems.map((item) => item.id);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(existingProducts.map((p) => [p.id, p]));
    const updates = [];

    // 2. Process validations rapidly in local server memory
    for (const item of cartItems) {
      const currentProduct = productMap.get(item.id);

      if (!currentProduct) {
        return { success: false, error: `Product ID ${item.id} no longer exists in the marketplace database index.` };
      }

      // Calculate and verify inventory level balances safely
      const updatedStock = currentProduct.countInStock - item.quantity;
      if (updatedStock < 0) {
        return { success: false, error: `Insufficient stock for "${currentProduct.name}". Only ${currentProduct.countInStock} available.` };
      }

      // Stage database mutations to be batch executed altogether
      updates.push(
        prisma.product.update({
          where: { id: item.id },
          data: { countInStock: updatedStock },
        })
      );
    }

    // 3. Commit all inventory updates in a fast, single-cycle database transaction array block
    await prisma.$transaction(updates);

    // Purge layout caches globally across your routes
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };

  } catch (error: any) {
    console.error("Transactional batch checkout execution failed:", error);
    return { success: false, error: error.message || "Failed processing order fulfillment." };
  }
}

export async function getVendorDashboardStats(userEmail: string) {
  try {
    if (!userEmail) {
      return { success: false, error: "Authentication missing. Please sign in again." };
    }

    // 1. Grab the user along with their unique storefront identity context
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail.trim().toLowerCase() },
      include: { vendorProfile: true }
    });

    if (!currentUser || !currentUser.vendorProfile) {
      return { success: false, error: "Access denied. Store profile not found." };
    }

    // 2. Fetch only the active product catalog listings belonging strictly to this storefront
    const products = await prisma.product.findMany({
      where: { vendorId: currentUser.vendorProfile.id },
      orderBy: { id: "desc" }
    });

    // 3. Return a clean payload for our front-end console layout to consume
    return {
      success: true,
      products,
      storeName: currentUser.vendorProfile.storeName,
      simulatedBalance: 0.00 // Ready to handle live local or schema-based calculations!
    };

  } catch (error) {
    console.error("Failed to compile dashboard metrics:", error);
    return { success: false, error: "Could not sync operational console metrics." };
  }
}

export async function getVendorById(vendorId: string) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    return vendor;
  } catch (error) {
    console.error("Error fetching vendor by ID:", error);
    return null;
  }
}

export async function getProductsByVendorId(vendorId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { vendorId: vendorId },
      include: { vendor: true },
      orderBy: { id: "desc" }
    });
    return products;
  } catch (error) {
    console.error("Error fetching vendor products by ID:", error);
    return [];
  }
}

export async function initiateMockCheckout(
  cartItems: { id: string; quantity: number; price: number }[],
  userEmail: string
) {
  try {
    // 1. Simulate a Secure Payment Session Verification
    const sessionSuccess = true; // In production, this would be a Stripe Token result
    
    if (!sessionSuccess) {
      return { success: false, error: "Payment verification failed." };
    }

    // 2. Perform Atomic Inventory Reconciliation
    const result = await processMarketplaceCheckout(cartItems);
    
    if (result.success) {
      // 3. Log the "Invoice" to the user's history
      const orderData = {
        orderId: Math.random().toString(36).substring(7).toUpperCase(),
        date: new Date().toLocaleDateString(),
        total: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        items: cartItems
      };

      const existingOrders = JSON.parse(localStorage.getItem(`orders_history_${userEmail}`) || "[]");
      localStorage.setItem(`orders_history_${userEmail}`, JSON.stringify([...existingOrders, orderData]));
      
      return { success: true, orderId: orderData.orderId };
    }
    
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: "System encountered an unexpected checkout error." };
  }
}

export async function submitProductReview(productId: string, rating: number, comment: string, userEmail: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return { success: false, error: "Authentication required." };

    await prisma.review.create({
      data: {
        productId,
        rating,
        comment,
        userId: user.id,
      }
    });
    
    revalidatePath(`/product/${productId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to submit review." };
  }
}

// Add or update this in actions/vendorActions.ts
export async function getProductById(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        vendor: true,
        reviews: {
          orderBy: { createdAt: 'desc' } // Shows newest reviews first
        }
      },
    });
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}