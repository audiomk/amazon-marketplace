import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext"; // Add this line

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amazon Multi-Vendor Marketplace",
  description: "Next.js 15 & Prisma Enterprise Architecture Prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap your system tree layout perfectly */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}