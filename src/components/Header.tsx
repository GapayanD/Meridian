import React, { useState } from "react";
import { Search, ShoppingCart, User, Menu, Bell } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export const Header: React.FC = () => {
  const { cartCount } = useCart();
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/category?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Header Top Bar */}
      <div className="hidden md:block bg-white border-b border-gray-100 py-2">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center text-[11px] font-medium text-gray-500">
          <div className="flex gap-4">
            <span className="hover:text-blue-600 cursor-pointer">
              {" "}
              Follow us on Socials
            </span>
            <a
              href="https://facebook.com/page-name"
              target="blank"
              rel="noopener noreferrer"
              className="border-1 border-gray-200 pl-4 hover:text-blue-600 cursor-pointer"
            >
              Meridian MART
            </a>
          </div>
          <div className="flex gap-4 items-center">
            <span className="hover:text-blue-600 cursor-pointer">Support</span>
            <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
              <Bell className="w-3 h-3" /> Notifications
            </div>
            <Link
              to="/cart"
              className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
            >
              <ShoppingCart className="w-3 h-3" /> Cart ({cartCount})
            </Link>
            <span className="font-bold text-gray-900 border-l border-gray-200 pl-4 cursor-pointer">
              Login / Register
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-0.5">
              <span className="text-2xl font-black tracking-tighter text-blue-600">
                MERIDIAN
              </span>
              <span className="text-2xl font-bold tracking-tighter text-gray-400">
                MART
              </span>
            </Link>

            {/* Search Bar - Styled to Geometric Theme */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-2xl hidden md:flex items-center relative"
            >
              <div className="w-full h-11 flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-4 gap-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search secure marketplace (Sanitized Inputs Only)"
                  className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9] text-gray-600 hover:bg-gray-200 transition">
                <Bell className="w-5 h-5" />
              </button>

              <Link
                to="/cart"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9] text-gray-600 hover:bg-gray-200 transition relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-100">
                <User className="w-5 h-5" />
              </button>

              <button className="md:hidden p-2 text-gray-600">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-3 h-10"
            >
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search premium products..."
                className="bg-transparent border-none outline-none w-full text-sm"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </form>
          </div>
        </div>
      </div>
    </header>
  );
};
