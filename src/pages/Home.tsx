import React, { useState, useEffect } from 'react';
import { Banner } from '../components/Banner';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/mock';
import { Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

// Real countdown: 8 hours 45 min 12 sec from mount
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

const Home: React.FC = () => {
  const flashSaleProducts = products.filter(p => p.isFlashSale);
  const regularProducts = products.filter(p => !p.isFlashSale);
  const countdown = useCountdown(8 * 3600 + 45 * 60 + 12);

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Banner */}
      <section>
        <Banner />
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Explore Categories</h2>
          </div>
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
          <Link to="/category" className="flex items-center gap-1 text-sm font-bold text-red-600 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {flashSaleProducts.map(product => (
            <div key={product.id} className="min-w-[200px] md:min-w-[240px] max-w-[200px] md:max-w-[240px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Grid + Side Wallet */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-[#1E293B]">Just For You</h2>
            <div className="hidden md:flex gap-2">
              {['All', 'Trending', 'Popular'].map(tab => (
                <button key={tab} className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-white border border-transparent hover:border-[#E2E8F0] transition">
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {regularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition">
            Load More Suggestions
          </button>
        </div>

        <div className="space-y-6">
          {/* Wallet Card */}
          <div className="bg-[#1E293B] rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold opacity-80">Wallet Balance</span>
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black mb-6 tracking-tight">$1,240.50</div>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-[#334155] border-none text-white py-2.5 rounded-lg font-bold text-xs hover:bg-[#475569] transition">
                Top Up
              </button>
              <button className="bg-[#2563EB] border-none text-white py-2.5 rounded-lg font-bold text-xs hover:bg-blue-700 transition">
                History
              </button>
            </div>
          </div>

          {/* Secure Checkout Promo */}
          <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[#1E293B] mb-4 uppercase tracking-tighter">Why Shop With Us</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span> Free returns within 30 days
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span> 100% genuine products
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span> Secure encrypted checkout
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span> 24/7 customer support
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#10B981] uppercase">
              <ShieldCheck className="w-3 h-3" /> 256-bit SSL Protection
            </div>
          </div>
        </div>
      </section>

      {/* Promotion Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Join Boutique Prime</h2>
          <p className="text-blue-100 mb-8 text-sm md:text-lg">Get free express shipping on all orders and exclusive early access to flash sales every weekend.</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl">
            Start Free Trial
          </button>
        </div>
        <Sparkles className="absolute -right-12 -top-12 w-64 h-64 text-white/10" />
      </section>
    </div>
  );
};

export default Home;
