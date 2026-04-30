import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { products as mockProducts } from '../data/mock';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Star, Truck, ShieldCheck, ArrowLeft, Heart,
  Share2, Plus, Minus, ShoppingBag, CreditCard,
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { motion } from 'motion/react';

const SkeletonDetail = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 animate-pulse">
    <div className="aspect-square bg-gray-100 rounded-3xl" />
    <div className="space-y-4 pt-4">
      <div className="h-4 bg-gray-100 rounded w-1/4" />
      <div className="h-8 bg-gray-100 rounded w-3/4" />
      <div className="h-4 bg-gray-100 rounded w-1/2" />
      <div className="h-10 bg-gray-100 rounded w-1/3" />
      <div className="h-24 bg-gray-100 rounded" />
    </div>
  </div>
);

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { product: dbProduct, loading, error } = useProduct(
    isSupabaseConfigured ? id : undefined,
  );

  // Normalise to a unified shape regardless of source
  const rawMock = !isSupabaseConfigured
    ? mockProducts.find(p => p.id === id) ?? null
    : null;

  const product = isSupabaseConfigured && dbProduct
    ? {
        id:            dbProduct.id,
        name:          dbProduct.name,
        price:         dbProduct.price,
        originalPrice: dbProduct.original_price ?? undefined,
        image:         dbProduct.image,
        images:        dbProduct.images.length ? dbProduct.images : [dbProduct.image],
        category:      dbProduct.category,
        rating:        dbProduct.rating,
        reviewsCount:  dbProduct.reviews_count,
        soldCount:     dbProduct.sold_count,
        description:   dbProduct.description,
        variants:      dbProduct.variants,
        isFlashSale:   dbProduct.is_flash_sale,
      }
    : rawMock
    ? {
        ...rawMock,
        images: rawMock.images.length ? rawMock.images : [rawMock.image],
      }
    : null;

  const [activeImage, setActiveImage]     = useState(0);
  const [selectedVariants, setVariants]   = useState<Record<string, string>>({});
  const [quantity, setQuantity]           = useState(1);
  const [wishlist, setWishlist]           = useState(false);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-6 bg-gray-100 rounded w-32 animate-pulse" />
        <SkeletonDetail />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Product not found</h2>
        <p className="text-gray-400 text-sm">It may have been removed or the link is incorrect.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    const allSelected = (product.variants ?? []).every(v => selectedVariants[v.type]);
    if (!allSelected) {
      alert('Please select all options before adding to cart.');
      return;
    }
    addToCart(product as any, selectedVariants, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Shopping
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <motion.div
            layoutId={`product-img-${product.id}`}
            className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100"
          >
            <img
              src={product.images[activeImage] ?? product.image}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={e => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image';
              }}
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex gap-3 flex-wrap">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setActiveImage(i)}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                    activeImage === i ? 'border-blue-600 scale-105' : 'border-gray-100 opacity-60',
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt={`Product view ${i + 1}`}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 px-2 py-1 bg-blue-50 rounded">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-gray-900">{product.rating}</span>
                <span className="text-gray-400 text-sm">({product.reviewsCount} reviews)</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <span className="text-gray-500 text-sm font-medium">
                {product.soldCount.toLocaleString()} sold
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-blue-600">{formatCurrency(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through font-medium">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {(product.variants ?? []).map(v => (
            <div key={v.type} className="space-y-3">
              <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Select {v.type}
              </label>
              <div className="flex flex-wrap gap-2">
                {v.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setVariants(prev => ({ ...prev, [v.type]: opt }))}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                      selectedVariants[v.type] === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-100 text-gray-600 hover:border-gray-300',
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quantity</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-12">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 h-full hover:bg-gray-50 transition"
                  aria-label="Decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 h-full hover:bg-gray-50 transition"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setWishlist(w => !w)}
                className={cn(
                  'p-3 border rounded-xl transition',
                  wishlist
                    ? 'border-red-200 text-red-500 bg-red-50'
                    : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200',
                )}
                aria-label="Add to wishlist"
              >
                <Heart className={cn('w-6 h-6', wishlist && 'fill-red-500')} />
              </button>
              <button className="p-3 border border-gray-200 rounded-xl text-gray-400 hover:text-blue-500 hover:border-blue-200 transition" aria-label="Share">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 h-14 bg-blue-50 text-blue-600 border-2 border-blue-100 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition"
            >
              <ShoppingBag className="w-5 h-5" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              <CreditCard className="w-5 h-5" /> Buy Now (COD)
            </button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-full text-green-600"><Truck className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-bold text-gray-900">Cash on Delivery</p>
                <p className="text-[10px] text-gray-500">Pay when it arrives</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-full text-blue-600"><ShieldCheck className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-bold text-gray-900">Genuine Products</p>
                <p className="text-[10px] text-gray-500">100% authentic</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-3 z-40">
        <button onClick={handleAddToCart} className="flex-1 h-12 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm">
          Add to Cart
        </button>
        <button onClick={handleBuyNow} className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-bold text-sm">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
