import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import { RefreshCw, ChevronDown, Eye, X, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  cart_items: CartItem[];
  delivery_method: string;
  subtotal: number;
  shipping_fee: number;
  total_price: number;
  notes: string;
  status: OrderStatus;
  created_at: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariants: Record<string, string>;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  shipped:   'bg-purple-50 text-purple-700 border border-purple-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// ─── Component ────────────────────────────────────────────────────────────────
const AdminOrders: React.FC = () => {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Order | null>(null);
  const [filterStatus, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch]       = useState('');
  const [updating, setUpdating]   = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selected?.id === orderId) setSelected(prev => prev ? { ...prev, status } : prev);
    }
    setUpdating(null);
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.id.includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, email, or order ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-blue-500 transition"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilter(e.target.value as OrderStatus | 'all')}
          className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm animate-pulse">Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No orders found.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.cart_items.length} item{order.cart_items.length > 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                      {formatCurrency(order.total_price)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                          className={cn(
                            'appearance-none pl-2 pr-6 py-1 rounded-lg text-xs font-bold cursor-pointer outline-none',
                            STATUS_STYLES[order.status],
                          )}
                        >
                          {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-PH', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(order)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        aria-label="View order details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">Order Details</h2>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-600">Status:</span>
                <select
                  value={selected.status}
                  disabled={updating === selected.id}
                  onChange={e => updateStatus(selected.id, e.target.value as OrderStatus)}
                  className={cn('px-3 py-1 rounded-lg text-sm font-bold outline-none', STATUS_STYLES[selected.status])}
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Customer */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                  <p><span className="font-semibold">Name:</span> {selected.customer_name}</p>
                  <p><span className="font-semibold">Phone:</span> {selected.phone}</p>
                  <p><span className="font-semibold">Email:</span> {selected.email}</p>
                  <p><span className="font-semibold">City:</span> {selected.city}</p>
                  <p><span className="font-semibold">Address:</span> {selected.address}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items</p>
                <div className="space-y-2">
                  {selected.cart_items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        {Object.entries(item.selectedVariants).length > 0 && (
                          <p className="text-xs text-gray-400">
                            {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-xs text-gray-400">×{item.quantity} @ {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatCurrency(selected.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping ({selected.delivery_method})</span>
                  <span>{formatCurrency(selected.shipping_fee)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total (COD)</span><span>{formatCurrency(selected.total_price)}</span>
                </div>
              </div>

              {selected.notes && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notes</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{selected.notes}</p>
                </div>
              )}

              <p className="text-xs text-gray-400">
                Placed on {new Date(selected.created_at).toLocaleString('en-PH')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
