import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV = [
  { label: 'Orders',   path: '/admin/orders',   icon: ShoppingBag },
  { label: 'Products', path: '/admin/products',  icon: Package },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [checking, setChecking]   = useState(true);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/admin/login'); return; }

      // Verify the user is in admin_users table
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (!data) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      setAdminEmail(session.user.email ?? '');
      setChecking(false);
    };

    checkAdmin();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/admin/login');
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 animate-pulse text-sm font-medium">Verifying access…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[#1E293B] text-white shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-0.5">
            <span className="font-black tracking-tighter text-blue-400">MERIDIAN</span>
            <span className="font-bold tracking-tighter text-gray-400">MART</span>
          </Link>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                location.pathname === path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-6 border-t border-white/10 pt-4">
          <p className="text-[10px] text-gray-500 px-3 mb-2 truncate">{adminEmail}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#1E293B] text-white px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-0.5">
          <span className="font-black tracking-tighter text-blue-400 text-sm">MERIDIAN</span>
          <span className="font-bold tracking-tighter text-gray-400 text-sm">MART</span>
        </Link>
        <button onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#1E293B] pt-14 px-4 flex flex-col">
          <nav className="space-y-1 mt-4">
            {NAV.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition',
                  location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-400',
                )}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-auto mb-8 flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto md:p-8 p-4 mt-14 md:mt-0">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
