import React, { useState, useEffect } from 'react';
import { Banner } from '../components/Banner';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductCard } from '../components/ProductCard';
import { useProducts, DBProduct } from '../hooks/useProducts';
import { products as mockProducts } from '../data/mock';
import { isSupabaseConfigured } from '../lib/supabase';
import { Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Countdown ──────────────────────────────────────────────────────────────────
function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return { h, m, s };
}

// ── Normalise DB product → ProductCard-compatible shape ────────────────────────
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

// ── Skeleton card ──────────────────────────────────────────────────────────────
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

// ── Page ───────────────────────────────────────────────────────────────────────
const Home: React.FC = () => {
  const countdown = useCountdown(8 * 3600 + 45 * 60 + 12);

  // If Supabase isn't configured yet, use mock data so the UI isn't blank
  const {
    products: dbFlash,
    loading: flashLoading,
  } = useProducts({ flashSaleOnly: true, limit: 8 });

  const {
    products: dbRegular,
    loading: regularLoading,
  } = useProducts({ flashSaleOnly: false, limit: 12 });

  const flashProducts = isSupabaseConfigured
    ? dbFlash.map(toCardProduct)
    : mockProducts.filter(p => p.isFlashSale);

  const regularProducts = isSupabaseConfigured
    ? dbRegular.filter(p => !p.is_flash_sale).map(toCardProduct)
    : mockProducts.filter(p => !p.isFlashSale);

  const loadingFlash   = isSupabaseConfigured && flashLoading;
  const loadingRegular = isSupabaseConfigured && regularLoading;

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero */}
      <section><Banner /></section>

      {/* Categories */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Explore Categories</h2>
        </div>
        <CategoryGrid />
      </section>

      {/* Flash Sales */}
      <section className="bg-red-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-8 md:rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-xl font-bold tracking-tight text-red-600">Flash Sale</h2>
            <div className="flex items-center gap-1 ml-4 py-1 px-3 bg-red-600 text-white rounded-lg text-sm font-bold tabular-nums">
              <span>{countdown.h}</span>:<span>{countdown.m}</span>:<span>{countdown.s}</span>
            </div>
          </div>
          <Link to="/category?flash=1" className="flex items-center gap-1 text-sm font-bold text-red-600 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {loadingFlash
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[200px] max-w-[200px]"><SkeletonCard /></div>
              ))
            : flashProducts.map(product => (
                <div key={product.id} className="min-w-[200px] md:min-w-[240px] max-w-[200px] md:max-w-[240px]">
                  <ProductCard product={product} />
                </div>
              ))
          }
          {!loadingFlash && flashProducts.length === 0 && (
            <p className="text-sm text-red-400 py-8">No flash sale items right now.</p>
          )}
        </div>
      </section>

      {/* Recommended + Sidebar */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Just For You</h2>
          </div>
          {loadingRegular ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {regularProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <Link
            to="/category"
            className="w-full mt-8 py-3 rounded-xl border border-gray-200 bg-white text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition flex items-center justify-center"
          >
            Browse All Products
          </Link>
        </div>

        <div className="space-y-6">
          {/* Wallet */}
          <div className="bg-[#1E293B] rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold opacity-80">Wallet Balance</span>
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black mb-6 tracking-tight">₱1,240.50</div>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-[#334155] text-white py-2.5 rounded-lg font-bold text-xs hover:bg-[#475569] transition">Top Up</button>
              <button className="bg-[#2563EB] text-white py-2.5 rounded-lg font-bold text-xs hover:bg-blue-700 transition">History</button>
            </div>
          </div>

          {/* Trust */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-tighter">Why Shop With Us</h3>
            <div className="space-y-3 text-sm text-gray-600">
              {[
                'Free returns within 30 days',
                '100% genuine products',
                'Cash on delivery available',
                '24/7 customer support',
              ].map(line => (
                <div key={line} className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span> {line}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase">
              <ShieldCheck className="w-3 h-3" /> Secure Order Processing
            </div>
          </div>
        </div>
      </section>
    </div>

  );
};

export default Home;
