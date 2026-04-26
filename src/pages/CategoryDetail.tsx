import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/mock';
import { ProductCard } from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { cn } from '../lib/utils';

const CategoryDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search')?.toLowerCase();
  const type = searchParams.get('type')?.toLowerCase();

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
      const matchesType = !type || p.category.toLowerCase() === type;
      return matchesSearch && matchesType;
    });
  }, [search, type]);

  return (
    <div className="space-y-6">
      {/* Top Bar / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Searching: "${search}"` : type ? `${type.charAt(0).toUpperCase() + type.slice(1)}` : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} items found</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2 border-r border-gray-100 pr-3 mr-1">
            <button className="p-2 bg-blue-50 text-blue-600 rounded-lg"><LayoutGrid className="w-4 h-4" /></button>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><List className="w-4 h-4" /></button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-medium hover:bg-gray-50 shrink-0">
            Sort: Relevance <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex md:hidden items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium shrink-0">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 space-y-8 shrink-0">
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Price Range
            </h4>
            <div className="space-y-3">
               {[
                 { label: 'Under $25', count: 12 },
                 { label: '$25 - $100', count: 45 },
                 { label: '$100 - $500', count: 28 },
                 { label: 'Above $500', count: 8 },
               ].map(filter => (
                 <label key={filter.label} className="flex items-center justify-between group cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-5 h-5 border-2 border-gray-200 rounded group-hover:border-blue-500 transition" />
                     <span className="text-sm text-gray-600">{filter.label}</span>
                   </div>
                   <span className="text-xs text-gray-400">({filter.count})</span>
                 </label>
               ))}
            </div>
          </div>

          <div>
             <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Brands</h4>
             <div className="space-y-3">
                {['Boutique Plus', 'Aura Tech', 'Velvet Home', 'Urban Fit'].map(brand => (
                  <label key={brand} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-5 h-5 border-2 border-gray-200 rounded group-hover:border-blue-500 transition" />
                    <span className="text-sm text-gray-600">{brand}</span>
                  </label>
                ))}
             </div>
          </div>

          <div>
             <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Customer Ratings</h4>
             <div className="space-y-3">
                {[5, 4, 3].map(rating => (
                  <label key={rating} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-5 h-5 border-2 border-gray-200 rounded group-hover:border-blue-500 transition" />
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      {rating} Stars & Up
                    </span>
                  </label>
                ))}
             </div>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <Filter className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No matching products</h3>
              <p className="text-gray-500 text-sm max-w-xs mt-2">Try adjusting your filters or search keywords to find what you're looking for.</p>
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
