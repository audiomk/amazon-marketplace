import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getVendorById, getProductsByVendorId } from "@/actions/vendorActions";
import { Store, UserCheck, Calendar } from "lucide-react";

export default async function StorefrontPage({ params }: { params: { storeId: string } }) {
  // Fetch vendor data and their specific products server-side
  const vendor = await getVendorById(params.storeId);
  const products = await getProductsByVendorId(params.storeId);

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[#eaeded] text-center p-12">
        <h1 className="text-xl font-bold">Store not found.</h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#eaeded]">
      <Header />
      
      {/* Store Banner */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            <div className="bg-[#febd69] p-6 rounded-full">
              <Store size={48} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-950">{vendor.storeName}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1"><UserCheck size={16}/> Verified Merchant</span>
                <span className="flex items-center gap-1"><Calendar size={16}/> Joined 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Inventory Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-950 mb-6">Inventory from {vendor.storeName}</h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500">This merchant has no active listings at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}