import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-pink-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Your Wishlist is Empty</h2>
      <p className="text-gray-500 mt-2 mb-8 max-w-xs">Save items you love and come back to them anytime.</p>
      <Link to="/" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">
        Explore Products
      </Link>
    </div>
  );
};

export default Wishlist;
