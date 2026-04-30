import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProducts, DBProduct } from '../hooks/useProducts';
import { products as mockProducts } from '../data/mock';
import { isSupabaseConfigured } from '../lib/supabase';
import { Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react';

// ── Skeleton ───────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-5 bg-gray-100 rounded w-1/3 mt-4" />
    </div>
  </div>
);

// Normalise DB → ProductCard shape
function toCardProduct(p: DBProduct) {
  return {
    id:           p.id,
    name:         p.name,
    price:        p.price,
    originalPrice: p.original_price ?? undefined,
    image:        p.image,
    images:       p.images,
    category:     p.category,
    rating:       p.rating,
    reviewsCount: p.reviews_count,
    soldCount:    p.sold_count,
    description:  p.description,
    variants:     p.variants,
    isFlashSale:  p.is_flash_sale,
  };
}

const CategoryDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const search      = searchParams.get('search') ?? undefined;
  const type        = searchParams.get('type')   ?? undefined;
  const flashOnly   = searchParams.get('flash') === '1';

  // Live Supabase fetch
  const { products: dbProducts, loading } = useProducts({
    category:     type,
    search,
    flashSaleOnly: flashOnly || undefined,
  });

  // Fallback to mock when Supabase isn't wired up
  const filteredMock = useMemo(() => {
    if (isSupabaseConfigured) return [];
    return mockProducts.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchType = !type || p.category.toLowerCase() === type.toLowerCase();
      const matchFlash = !flashOnly || p.isFlashSale;
      return matchSearch && matchType && matchFlash;
    });
  }, [search, type, flashOnly]);

  const products = isSupabaseConfigured ? dbProducts.map(toCardProduct) : filteredMock;
  const isLoading = isSupabaseConfigured && loading;

  const pageTitle = search
    ? `Results for "${search}"`
    : flashOnly
    ? 'Flash Sale'
    : type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : 'All Products';

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading ? 'Loading…' : `${products.length} item${products.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2 border-r border-gray-100 pr-3 mr-1">
            <button className="p-2 bg-blue-50 text-blue-600 rounded-lg" aria-label="Grid view">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg" aria-label="List view">
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-medium hover:bg-gray-50 shrink-0">
            Sort: Relevance <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block w-64 space-y-8 shrink-0">
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Price Range
            </h4>
            <div className="space-y-3">
              {[
                { label: 'Under $25', count: 12 },
                { label: '$25 – $100', count: 45 },
                { label: '$100 – $500', count: 28 },
                { label: 'Above $500', count: 8 },
              ].map(f => (
                <label key={f.label} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-200 rounded group-hover:border-blue-500 transition" />
                    <span className="text-sm text-gray-600">{f.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">({f.count})</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Customer Ratings</h4>
            <div className="space-y-3">
              {[5, 4, 3].map(r => (
                <label key={r} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-5 h-5 border-2 border-gray-200 rounded group-hover:border-blue-500 transition" />
                  <span className="text-sm text-gray-600">{r} Stars & Up</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Filter className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No matching products</h3>
              <p className="text-gray-500 text-sm max-w-xs mt-2">
                Try adjusting your filters or search keywords.
              </p>
              <button
                onClick={() => window.history.back()}
                className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
