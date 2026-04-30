import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import CategoryDetail from './pages/CategoryDetail';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* ── Public storefront ─────────────────────────────── */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/category" element={<Layout><CategoryDetail /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />

          {/* ── Admin (no storefront Layout) ──────────────────── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/orders"
            element={<AdminLayout><AdminOrders /></AdminLayout>}
          />
          <Route
            path="/admin/products"
            element={<AdminLayout><AdminProducts /></AdminLayout>}
          />
          {/* Redirect bare /admin to orders */}
          <Route
            path="/admin"
            element={<AdminLayout><AdminOrders /></AdminLayout>}
          />

          {/* Fallback */}
          <Route path="*" element={<Layout><Home /></Layout>} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
