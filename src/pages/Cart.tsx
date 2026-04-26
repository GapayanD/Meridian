import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency, sanitizeInput, validators, cn } from '../lib/utils';
import { Trash2, Plus, Minus, Truck, CreditCard, ShieldCheck, CheckCircle, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: Cart Review, 2: Checkout
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    country: 'USA',
    delivery: 'Standard - $5',
    payment: 'Credit Card',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const shippingFee = formData.delivery.includes('Express') ? 15 : formData.delivery.includes('Standard') ? 5 : 0;
  const finalTotal = cartTotal + shippingFee;

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Required';
    if (!validators.email(formData.email)) errors.email = 'Invalid email';
    if (!validators.phone(formData.phone)) errors.phone = 'Invalid phone';
    if (!formData.city.trim()) errors.city = 'Required';
    if (!formData.address.trim()) errors.address = 'Required';
    return errors;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      // 1. Sanitize data before sending to DB
      const sanitizedData = {
        customer_name: sanitizeInput(formData.name),
        phone: sanitizeInput(formData.phone),
        email: sanitizeInput(formData.email),
        city: sanitizeInput(formData.city),
        address: sanitizeInput(formData.address),
        country: sanitizeInput(formData.country),
        cart_items: cart.map(item => ({
          id: item.id,
          name: item.name,
          variant: item.selectedVariants,
          quantity: item.quantity,
          price: item.price
        })),
        delivery_method: sanitizeInput(formData.delivery),
        payment_method: sanitizeInput(formData.payment),
        total_price: finalTotal,
        notes: sanitizeInput(formData.notes),
        status: 'pending'
      };

      // 2. Supabase Insert (INSERT ONLY PRIVILEGE RECOMMENDED ON DB)
      const { error } = await supabase.from('orders').insert([sanitizedData]);

      if (error) throw error;

      setOrderStatus('success');
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      setOrderStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-24 w-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900">Order Successful!</h2>
        <p className="text-gray-500 max-w-sm">Your order has been placed and is currently pending review. We will contact you soon with tracking details.</p>
        <Link to="/" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">Return Home</Link>
      </div>
    );
  }

  if (cart.length === 0 && orderStatus === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Side: Cart Items or Form */}
      <div className="lg:col-span-2 space-y-8">
        {step === 1 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Review Cart <span className="text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{cart.length} Items</span>
            </h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={`${item.id}-${JSON.stringify(item.selectedVariants)}`} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.id, Object.entries(item.selectedVariants).map(([k, v]) => `${k}:${v}`).sort().join('|'))}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(item.selectedVariants).map(([key, value]) => (
                          <span key={key} className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-bold text-blue-600">{formatCurrency(item.price)}</span>
                      <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden h-8">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-blue-100 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4" /> Edit Cart
            </button>

            <form onSubmit={handleCheckout} className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><Truck className="w-5 h-5 text-blue-600" /> Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className={cn("w-full h-12 px-4 rounded-xl border-2 outline-none focus:border-blue-600", formErrors.name ? "border-red-200 bg-red-50" : "border-gray-50 bg-gray-50")}
                    />
                    {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className={cn("w-full h-12 px-4 rounded-xl border-2 outline-none focus:border-blue-600", formErrors.phone ? "border-red-200 bg-red-50" : "border-gray-50 bg-gray-50")}
                    />
                    {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className={cn("w-full h-12 px-4 rounded-xl border-2 outline-none focus:border-blue-600", formErrors.email ? "border-red-200 bg-red-50" : "border-gray-50 bg-gray-50")}
                    />
                    {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                      className={cn("w-full h-12 px-4 rounded-xl border-2 outline-none focus:border-blue-600", formErrors.city ? "border-red-200 bg-red-50" : "border-gray-50 bg-gray-50")}
                    />
                    {formErrors.city && <p className="text-xs text-red-500">{formErrors.city}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Street Address</label>
                    <textarea
                      value={formData.address}
                      onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                      className={cn("w-full px-4 pt-3 rounded-xl border-2 outline-none focus:border-blue-600 h-24 resize-none", formErrors.address ? "border-red-200 bg-red-50" : "border-gray-50 bg-gray-50")}
                    />
                    {formErrors.address && <p className="text-xs text-red-500">{formErrors.address}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Notes (Optional)</label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Special instructions..."
                      className="w-full h-12 px-4 rounded-xl border-2 outline-none focus:border-blue-600 border-gray-50 bg-gray-50"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" /> Payment & Delivery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Method</label>
                    {['Standard - $5', 'Express - $15', 'Free Shipping'].map(m => (
                      <div key={m} onClick={() => setFormData(p => ({ ...p, delivery: m }))} className={cn("p-4 rounded-xl border-2 cursor-pointer transition flex justify-between items-center", formData.delivery === m ? "border-blue-600 bg-blue-50" : "border-gray-100")}>
                        <span className="text-sm font-semibold">{m}</span>
                        <div className={cn("w-4 h-4 rounded-full border-2", formData.delivery === m ? "border-blue-600 bg-blue-600" : "border-gray-300")} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</label>
                    {['Credit Card', 'PayPal', 'G-Cash / GrabPay', 'COD'].map(m => (
                      <div key={m} onClick={() => setFormData(p => ({ ...p, payment: m }))} className={cn("p-4 rounded-xl border-2 cursor-pointer transition flex justify-between items-center", formData.payment === m ? "border-blue-600 bg-blue-50" : "border-gray-100")}>
                        <span className="text-sm font-semibold">{m}</span>
                        <div className={cn("w-4 h-4 rounded-full border-2", formData.payment === m ? "border-blue-600 bg-blue-600" : "border-gray-300")} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {orderStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">Something went wrong. Please check your connection and try again.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full h-16 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-3",
                  isSubmitting ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100"
                )}
              >
                {isSubmitting ? 'Processing Order...' : 'Complete Purchase'}
                {!isSubmitting && <CheckCircle className="w-5 h-5 text-blue-200" />}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Right Side: Order Summary */}
      <div className="h-fit sticky top-24 space-y-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">Order Summary</h3>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={`${item.id}-${JSON.stringify(item.selectedVariants)}`} className="flex justify-between text-sm text-gray-500">
                <span className="truncate max-w-[160px]">{item.name} ×{item.quantity}</span>
                <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm text-gray-500">
              <span>Shipping ({formData.delivery.split(' - ')[0]})</span>
              <span className="font-bold text-gray-900">{formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Estimated Tax</span>
              <span className="font-bold text-gray-900">$0.00</span>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-black text-blue-600">{formatCurrency(finalTotal)}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Secure Payment Guaranteed
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
