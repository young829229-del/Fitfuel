import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, ShoppingBag, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, totalPrice, placeOrder } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Kathmandu, Nepal');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address) return;
    setIsPlacing(true);
    try {
      const orderId = await placeOrder({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        paymentMethod
      });
      setPlacedOrderId(orderId);
      setCheckoutStep('success');
    } catch (err) {
      console.error("Order error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (checkoutStep === 'success') {
      setCheckoutStep('cart');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                {checkoutStep === 'cart' ? 'Shopping Cart' : checkoutStep === 'checkout' ? 'Quick Checkout' : 'Order Confirmed'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {checkoutStep === 'cart' && (
              cart.length === 0 ? (
                <div className="py-20 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Your cart is empty.</p>
                  <p className="text-xs text-gray-400 mt-1">Select a supplement from the 3D showcase to add it to your cart.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 items-center">
                      <img
                        src={item.image || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-contain bg-white rounded-xl p-1 border border-gray-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                        <div className="text-xs font-semibold text-gray-600 mt-0.5">${item.price.toFixed(2)}</div>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden text-xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 hover:bg-gray-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 hover:bg-gray-100 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-black text-gray-950 self-end">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {checkoutStep === 'checkout' && (
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Thapa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+977 9801234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Shipping Address in Nepal *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Street, City, Ward / Landmark..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white font-medium"
                  >
                    <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                    <option value="eSewa / Khalti / Mobile Banking">eSewa / Khalti / Mobile Banking</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                  </select>
                </div>
              </form>
            )}

            {checkoutStep === 'success' && (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Order Placed Successfully!</h3>
                <p className="text-xs text-gray-500 font-mono">Reference: #{placedOrderId}</p>
                <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
                  Thank you for your purchase! Our team will dispatch your supplements immediately. You can track this order in the admin portal.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {checkoutStep !== 'success' && cart.length > 0 && (
            <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/60">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-xl font-black text-gray-950">${totalPrice.toFixed(2)}</span>
              </div>

              {checkoutStep === 'cart' ? (
                <button
                  onClick={() => setCheckoutStep('checkout')}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-sm uppercase tracking-wider rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold text-xs uppercase rounded-xl hover:bg-gray-100 transition"
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isPlacing}
                    className="flex-2 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isPlacing ? 'Placing Order...' : 'Confirm Order'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
