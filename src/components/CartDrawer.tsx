import React, { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatImageUrl } from '../utils/imageUrl';
import { uploadImageToStorage } from '../lib/storage';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  AlertCircle,
  Truck,
  CheckCircle2,
  QrCode,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    deliveryCharge, 
    discountAmount, 
    totalPrice,
    appliedCoupon,
    couponMessage,
    applyCoupon,
    removeCoupon,
    placeOrder
  } = useCart();

  const { settings } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  // Checkout Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Kathmandu',
    notes: '',
    paymentMethodId: '' // Track the selected method ID
  });
  
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  const selectedMethod = settings.paymentMethods?.find(m => m.id === formData.paymentMethodId) || settings.paymentMethods?.find(m => m.enabled);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setFormError('Please fill in your name, phone number, and delivery address.');
      return;
    }

    if (!formData.paymentMethodId) {
      setFormError('Please select a payment method.');
      return;
    }

    if (selectedMethod?.type === 'qr' && !screenshotFile) {
      setFormError('Please upload a screenshot of your payment.');
      return;
    }

    setIsSubmitting(true);
    try {
      let paymentScreenshot = '';
      if (screenshotFile) {
        paymentScreenshot = await uploadImageToStorage(screenshotFile, 'payments');
      }

      const orderNumber = await placeOrder({
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        shippingAddress: `${formData.address.trim()}, ${formData.city}`,
        city: formData.city,
        notes: formData.notes.trim(),
        paymentMethod: selectedMethod?.name || 'Unknown',
        paymentScreenshot
      });

      setConfirmedOrderId(orderNumber);
      setIsCheckingOut(false);
      setScreenshotFile(null);
      setScreenshotPreview(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-black" />
            <h2 className="text-base font-black text-black">Your Cart</h2>
            <span className="text-xs font-bold text-gray-400">
              ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </span>
          </div>
          <button 
            onClick={() => {
              setIsCartOpen(false);
              setConfirmedOrderId(null);
            }}
            className="p-2 text-gray-400 hover:text-black rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Order Placed Success View */}
          {confirmedOrderId ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-black text-black">Order Confirmed!</h3>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Thank you for choosing {settings.storeName || 'FitFul Nepal'}. Your order has been placed in our system and is being processed.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 w-full max-w-xs">
                <p className="text-[11px] font-bold text-gray-400 uppercase">Order Number</p>
                <p className="text-base font-black text-black mt-0.5">Rs. {confirmedOrderId}</p>
              </div>
              <button
                onClick={() => {
                  setConfirmedOrderId(null);
                  setIsCartOpen(false);
                }}
                className="mt-4 px-6 py-3 bg-black text-white text-xs font-bold rounded-2xl hover:bg-neutral-800 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Your cart is empty</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Discover our premium supplements formulations and fuel your athletic performance.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-2xl"
              >
                Start Shopping
              </button>
            </div>
          ) : isCheckingOut ? (
            /* Checkout Form View */
            <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs font-medium">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-black text-black">Delivery Details</h3>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-xs text-gray-500 hover:text-black font-semibold"
                >
                  ← Back to cart
                </button>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sujan Shrestha"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Shipping Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street address, ward, or landmark"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">City / Region</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                >
                  <option value="Kathmandu">Kathmandu</option>
                  <option value="Lalitpur">Lalitpur</option>
                  <option value="Bhaktapur">Bhaktapur</option>
                  <option value="Pokhara">Pokhara</option>
                  <option value="Other Nepal Cities">Other Nepal Cities</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Payment Method *</label>
                <div className="grid grid-cols-1 gap-2">
                  {settings.paymentMethods?.filter(m => m.enabled).map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethodId: method.id }))}
                      className={`py-3 px-4 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                        formData.paymentMethodId === method.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {method.type === 'qr' ? <QrCode className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                        {method.name}
                      </span>
                      {formData.paymentMethodId === method.id && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {selectedMethod?.type === 'qr' && (
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="text-center space-y-3">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      {selectedMethod.instructions || `Scan QR to Pay via ${selectedMethod.name}`}
                    </p>
                    {selectedMethod.qrImage ? (
                      <div className="bg-white p-3 rounded-2xl border border-gray-200 inline-block shadow-sm">
                        <img 
                          src={formatImageUrl(selectedMethod.qrImage)} 
                          alt={`${selectedMethod.name} QR`} 
                          className="w-44 h-44 object-contain mx-auto" 
                        />
                      </div>
                    ) : (
                      <div className="w-44 h-44 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                        <QrCode className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase text-gray-600">Drop your payment screenshot (SS) *</label>
                    <div 
                      onClick={() => screenshotInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${
                        screenshotPreview ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        ref={screenshotInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleScreenshotChange}
                      />
                      {screenshotPreview ? (
                        <div className="relative w-full text-center">
                          <img src={screenshotPreview} alt="Screenshot preview" className="h-32 object-contain mx-auto rounded-lg shadow-sm" />
                          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Screenshot Attached</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-1">
                          <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Tap to Upload Payment SS</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Delivery Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Call before arrival, ring bell..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-black text-white rounded-2xl font-black text-sm hover:bg-neutral-800 transition active:scale-[0.99] disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Placing Order...' : `Confirm Order (Rs. ${totalPrice.toFixed(0)})`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Standard Cart List View */
            <div className="space-y-4">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={formatImageUrl(item.image)}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs font-black text-black mt-0.5">Rs. {item.price.toFixed(0)}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:text-black"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold px-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:text-black"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="pt-4 border-t border-gray-100">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon code (e.g. FITFUL10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-bold focus:outline-hidden focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition"
                  >
                    Apply
                  </button>
                </form>

                {couponMessage && (
                  <p className={`text-[11px] mt-1.5 font-semibold ${appliedCoupon ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {couponMessage}
                  </p>
                )}

                {appliedCoupon && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{appliedCoupon} Applied</span>
                    <button onClick={removeCoupon} className="text-emerald-600 hover:text-red-500 ml-1">×</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {!confirmedOrderId && cart.length > 0 && !isCheckingOut && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/70 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(0)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-Rs. {discountAmount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  Delivery Charge
                </span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `Rs. ${deliveryCharge.toFixed(0)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-black pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>Rs. {totalPrice.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="w-full py-4 bg-black text-white rounded-2xl font-black text-sm hover:bg-neutral-800 transition active:scale-[0.99] shadow-md flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>


          </div>
        )}
      </div>
    </div>
  );
}
