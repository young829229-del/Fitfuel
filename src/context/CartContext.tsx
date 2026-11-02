import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStore } from './StoreContext';

export interface CartProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

interface CartContextType {
  cart: CartProductItem[];
  addToCart: (item: any, customQty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCount: number;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  totalPrice: number;
  appliedCoupon: string;
  couponMessage: string;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  placeOrder: (customerDetails: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    city?: string;
    notes?: string;
    paymentMethod?: string;
  }) => Promise<string>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, validateCoupon, createOrder } = useStore();

  const [cart, setCart] = useState<CartProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('fitful_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('fitful_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart = (product: any, customQty?: number) => {
    const qty = customQty !== undefined ? customQty : (product.quantity || 1);
    const prodId = typeof product === 'string' ? product : product.id;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === prodId);
      if (existing) {
        return prev.map((item) =>
          item.id === prodId ? { ...item, quantity: item.quantity + qty } : item
        );
      } else {
        return [
          ...prev,
          {
            id: prodId,
            name: product.name || 'Supplement Product',
            price: Number(product.price) || 24.99,
            quantity: qty,
            image: product.image || (product.images && product.images[0]),
            slug: product.slug
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon('');
    setDiscountAmount(0);
    setCouponMessage('');
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));

  // Dynamic delivery charge from Firebase Store Settings
  const deliveryCharge = (subtotal >= (settings?.freeDeliveryThreshold || 50) || subtotal === 0) 
    ? 0 
    : (settings?.deliveryCharge || 4.99);

  // Recalculate discount if coupon applied
  useEffect(() => {
    if (appliedCoupon && subtotal > 0) {
      const result = validateCoupon(appliedCoupon, subtotal);
      if (result.valid) {
        setDiscountAmount(result.discountAmount);
        setCouponMessage(result.message);
      } else {
        setDiscountAmount(0);
        setCouponMessage(result.message);
      }
    } else if (subtotal === 0) {
      setDiscountAmount(0);
    }
  }, [appliedCoupon, subtotal, validateCoupon]);

  const applyCoupon = (code: string) => {
    const result = validateCoupon(code, subtotal);
    if (result.valid) {
      setAppliedCoupon(code.toUpperCase().trim());
      setDiscountAmount(result.discountAmount);
      setCouponMessage(result.message);
    } else {
      setCouponMessage(result.message);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
    setDiscountAmount(0);
    setCouponMessage('');
  };

  const totalPrice = Number(Math.max(0, subtotal - discountAmount + deliveryCharge).toFixed(2));

  const placeOrder = async (customerDetails: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    city?: string;
    notes?: string;
    paymentMethod?: string;
  }): Promise<string> => {
    const orderNumber = await createOrder({
      customerName: customerDetails.customerName,
      customerEmail: customerDetails.customerEmail,
      customerPhone: customerDetails.customerPhone,
      shippingAddress: customerDetails.shippingAddress,
      city: customerDetails.city || '',
      notes: customerDetails.notes || '',
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        slug: i.slug
      })),
      subtotal,
      deliveryCharge,
      discountAmount,
      totalAmount: totalPrice,
      couponCode: appliedCoupon || undefined,
      paymentMethod: customerDetails.paymentMethod || 'Cash on Delivery (COD)',
      paymentStatus: 'Pending',
      orderStatus: 'Pending'
    });

    clearCart();
    return orderNumber;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalCount,
        subtotal,
        deliveryCharge,
        discountAmount,
        totalPrice,
        appliedCoupon,
        couponMessage,
        applyCoupon,
        removeCoupon,
        placeOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
