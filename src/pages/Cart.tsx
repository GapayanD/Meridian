import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency, sanitizeInput, validators, cn } from '../lib/utils';
import {
  Trash2, Plus, Minus, Truck, ShieldCheck, CheckCircle,
  AlertCircle, ShoppingBag, ArrowLeft, Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  country: string;
  delivery: string;
  notes: string;
}

const DELIVERY_OPTIONS = [
  { label: 'Standard Delivery', fee: 5, days: '3–5 days' },
  { label: 'Express Delivery', fee: 15, days: '1–2 days' },
  { label: 'Free Shipping', fee: 0, days: '7–10 days' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const [form, setForm] = useState<FormData>({
    name: '', phone: '', email: '', city: '',
    address: '', country: 'PH', delivery: 'Standard Delivery', notes: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const selectedDelivery = DELIVERY_OPTIONS.find(o => o.label === form.delivery)!;
  const shippingFee = selectedDelivery?.fee ?? 5;
  // NOTE: this is only for display. The server recalculates the real total.
  const displayTotal = cartTotal + shippingFee;

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.name.trim())               e.name    = 'Full name is required';
    if (!validators.email(form.email))   e.email   = 'Enter a valid email';
    if (!validators.phone(form.phone))   e.phone   = 'Enter a valid phone number';
    if (!form.city.trim())               e.city    = 'City is required';
    if (!form.address.trim())            e.address = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const payload = {
        customer_name:   sanitizeInput(form.name),
        phone:           sanitizeInput(form.phone),
        email:           sanitizeInput(form.email),
        city:            sanitizeInput(form.city),
        address:         sanitizeInput(form.address),
        country:         sanitizeInput(form.country),
        notes:           sanitizeInput(form.notes),
        delivery_method: form.delivery,
        // Prices are intentionally NOT sent — edge function
        // re-fetches them from the DB so clients cannot spoof totals.
        cart_items: cart.map(item => ({
          id:               item.id,
          quantity:         item.quantity,
          selectedVariants: item.selectedVariants,
        })),
      };

      const { data, error } = await supabase.functions.invoke('validate-order', {
        body: payload,
      });

      if (error || !data?.success) {
        throw new Error(data?.error ?? error?.message ?? 'Unknown error');
      }

      clearCart();
      setOrderStatus('success');
    } catch (err: any) {
      console.error('[Cart] checkout error:', err);
      setServerError(err.message ?? 'Something went wrong. Please try again.');
      setOrderStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared input classes ────────────────────────────────────────────────────
  const inputCls = (field: keyof FormData) =>
    cn(
      'w-full h-12 px-4 rounded-xl border-2 outline-none transition focus:border-blue-600',
      errors[field] ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50',
    );

  // ── Success screen ──────────────────────────────────────────────────────────
  if (orderStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="h-24 w-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-100"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900">Order Placed!</h2>
        <p className="text-gray-500 max-w-sm">
          Your COD order is confirmed. Our team will contact you shortly to arrange delivery.
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2 mb-8">Add some products to get started.</p>
        <Link to="/" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">
          Start Shopping
        </Link>
      </div>
    );
  }

  // ── Main cart ───────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: cart review or checkout form */}
      <div className="lg:col-span-2 space-y-8">
        {step === 1 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Your Cart
              <span className="text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                {cart.length} item{cart.length > 1 ? 's' : ''}
              </span>
            </h2>

            <div className="space-y-4">
              {cart.map(item => {
                const variantKey = Object.entries(item.selectedVariants)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([k, v]) => `${k}:${v}`)
                  .join('|');

                return (
                  <div
                    key={`${item.id}-${variantKey}`}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/96x96?text=img'; }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.id, variantKey)}
                          className="text-gray-400 hover:text-red-500 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {Object.entries(item.selectedVariants).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(item.selectedVariants).map(([k, v]) => (
                            <span key={k} className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-blue-600">{formatCurrency(item.price)}</span>
                        <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden h-8">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, variantKey)}
                            className="px-2 hover:bg-gray-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, variantKey)}
                            className="px-2 hover:bg-gray-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100"
            >
              Proceed to Checkout
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Edit Cart
            </button>

            <form onSubmit={handleCheckout} className="space-y-8">
              {/* Shipping details */}
              <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" /> Delivery Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name" error={errors.name}>
                    <input type="text" value={form.name} className={inputCls('name')}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </Field>
                  <Field label="Phone Number" error={errors.phone}>
                    <input type="tel" value={form.phone} className={inputCls('phone')}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </Field>
                  <Field label="Email Address" error={errors.email} className="md:col-span-2">
                    <input type="email" value={form.email} className={inputCls('email')}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </Field>
                  <Field label="City" error={errors.city}>
                    <input type="text" value={form.city} className={inputCls('city')}
                      onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                  </Field>
                  <Field label="Street Address" error={errors.address} className="md:col-span-2">
                    <textarea
                      value={form.address}
                      className={cn(inputCls('address'), 'h-24 pt-3 resize-none')}
                      onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    />
                  </Field>
                  <Field label="Order Notes (optional)" className="md:col-span-2">
                    <input type="text" value={form.notes} placeholder="Special instructions..."
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 bg-gray-50 outline-none focus:border-blue-600 transition"
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                  </Field>
                </div>
              </section>

              {/* Delivery method */}
              <section className="space-y-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" /> Delivery Method
                </h3>
                {DELIVERY_OPTIONS.map(opt => (
                  <div
                    key={opt.label}
                    onClick={() => setForm(p => ({ ...p, delivery: opt.label }))}
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition flex justify-between items-center',
                      form.delivery === opt.label ? 'border-blue-600 bg-blue-50' : 'border-gray-100',
                    )}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.days}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">
                        {opt.fee === 0 ? 'FREE' : formatCurrency(opt.fee)}
                      </span>
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2',
                        form.delivery === opt.label ? 'border-blue-600 bg-blue-600' : 'border-gray-300',
                      )} />
                    </div>
                  </div>
                ))}
              </section>

              {/* COD notice */}
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-bold text-amber-800 text-sm">Cash on Delivery</p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    Payment is collected when your order arrives. Please have the exact amount ready.
                  </p>
                </div>
              </div>

              {/* Server error */}
              {serverError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{serverError}</p>
                </div>
              )}

              {!isSupabaseConfigured && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm font-medium">
                  ⚠ Supabase is not configured. Orders cannot be saved. Add your env vars to .env.local
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'w-full h-16 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-3',
                  isSubmitting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100',
                )}
              >
                {isSubmitting ? (
                  <><span className="animate-spin">⏳</span> Placing Order…</>
                ) : (
                  <><CheckCircle className="w-5 h-5" /> Place COD Order</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Right: order summary */}
      <div className="h-fit sticky top-24 space-y-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">
            Order Summary
          </h3>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-500">
                <span className="truncate max-w-[160px]">{item.name} ×{item.quantity}</span>
                <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm text-gray-500">
              <span>Shipping ({form.delivery})</span>
              <span className="font-bold text-gray-900">
                {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
              </span>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-black text-blue-600">{formatCurrency(displayTotal)}</span>
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            Final total is confirmed server-side at order submission.
          </p>
          <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Secure Order Processing
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Small helper component ────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}
const Field: React.FC<FieldProps> = ({ label, error, className, children }) => (
  <div className={cn('space-y-1', className)}>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default Cart;
