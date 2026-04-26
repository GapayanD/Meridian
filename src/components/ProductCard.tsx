import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl border border-[#F1F5F9] overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
          {product.isFlashSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
              Flash Deal
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-[#1E293B] text-sm line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition mb-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-[#2563EB] font-extrabold text-lg">
              {formatCurrency(product.price)}
            </span>
            <button 
              onClick={handleAddToCart}
              className="h-8 w-8 bg-[#F1F5F9] rounded-full flex items-center justify-center text-[#64748B] hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#94A3B8]">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-bold text-[#475569]">{product.rating}</span>
            </div>
            <span className="font-medium">{product.soldCount.toLocaleString()} sold</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
