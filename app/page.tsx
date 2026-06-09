import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getAllMarketplaceProducts } from "@/actions/vendorActions";
import { SearchX, SlidersHorizontal, Grid } from "lucide-react";

// Server Components are async by default
export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Fetch data directly on the server
  const res = await getAllMarketplaceProducts();
  const allProducts = res.success ? res.products : [];
  
  const searchQuery = (searchParams.search as string) || "";
  
  // Filter and sort logic happens server-side before rendering
  const filteredProducts = allProducts.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.vendor?.storeName && p.vendor.storeName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-[#eaeded]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-sm p-6 text-white mb-6 shadow-sm border border-slate-700">
          <h2 className="text-xl font-bold mb-1">Welcome to the Next-Gen Multi-Vendor Feed</h2>
          <p className="text-xs text-slate-300">Discover and acquire items distributed instantly by global merchant storefront channels.</p>
        </div>

        <div className="bg-white p-3 rounded-sm border border-gray-300 shadow-sm flex items-center justify-between mb-6 text-xs text-black">
          <div className="flex items-center gap-2 font-medium text-gray-700">
            <SlidersHorizontal size={14} className="text-gray-500" />
            <span>Showing {filteredProducts.length} results</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-sm p-12 text-center max-w-md mx-auto my-8 shadow-sm">
            <SearchX size={44} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-gray-950 mb-1">No matching results</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">Check your spelling or clear your current query filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}