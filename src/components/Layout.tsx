import React from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { motion } from "motion/react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pb-24 md:pb-12 pt-4 md:pt-8 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 lg:px-8"
        >
          {children}
        </motion.div>
      </main>
      <MobileNav />
      {/* Footer - Desktop */}
      <footer className="hidden md:block py-12 border-t border-gray-100 bg-gray-50/50 mt-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-0.5 mb-3">
                <span className="text-xl font-black tracking-tighter text-blue-600">
                  MERIDIAN
                </span>
                <span className="text-xl font-bold tracking-tighter text-gray-400">
                  MART
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                The premium marketplace for local products. Curated for style, comfort, and innovation.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">
                Customer Care
              </h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    How to Buy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Shipping & Delivery
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Returns & Refunds
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">
                Contact Info
              </h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>Support: help@meridian.com</li>
                <li>Phone: +1 234 567 890</li>
                <li>Mon–Fri: 8am – 9pm PST</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            © 2026 Meridian. Premium Design. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
