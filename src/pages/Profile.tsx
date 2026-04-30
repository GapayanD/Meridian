import React from 'react';
import { User, Package, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const menuItems = [
  { icon: Package, label: 'My Orders', desc: 'Track and manage your orders', path: '/cart' },
  { icon: Heart, label: 'Wishlist', desc: 'Items you saved for later', path: '/wishlist' },
  { icon: Settings, label: 'Settings', desc: 'Account preferences', path: '#' },
  { icon: LogOut, label: 'Sign Out', desc: 'Log out of your account', path: '#' },
];

const Profile: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200 mb-4">
          <User className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Guest User</h2>
        <p className="text-gray-500 text-sm mt-1">Sign in to access your account</p>
        <button className="mt-4 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100">
          Login / Register
        </button>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {menuItems.map(({ icon: Icon, label, desc, path }) => (
          <Link
            key={label}
            to={path}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">Meridian Marketplace v1.0 · © 2026</p>
    </div>
  );
};

export default Profile;
