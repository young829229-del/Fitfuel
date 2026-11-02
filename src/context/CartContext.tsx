import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { OrderItem } from '../types/store';

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
  totalPrice: number;
  placeOrder: (customerDetails: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    paymentMethod?: string;
  }) => Promise<string>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('fitful_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('fitful_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart = (product: any, customQty?: number) => {
    const qty = customQty !== undefined ? customQty : (product.quantity || 1);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
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

  const clearCart = () => setCart([]);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async (customerDetails: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    paymentMethod?: string;
  }): Promise<string> => {
    const orderId = `ord-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: orderId,
      customerName: customerDetails.customerName,
      customerEmail: customerDetails.customerEmail,
      customerPhone: customerDetails.customerPhone || '',
      shippingAddress: customerDetails.shippingAddress,
      paymentMethod: customerDetails.paymentMethod || 'Cash on Delivery (COD)',
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image
      })),
      totalAmount: totalPrice,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'orders', orderId), newOrder);
    clearCart();
    return orderId;
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
        totalPrice,
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
