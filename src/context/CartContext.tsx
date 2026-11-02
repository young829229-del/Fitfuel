import React, { createContext, useContext, useState } from 'react';

type CartItem = { id: string; quantity: number };
const CartContext = createContext<{ cart: CartItem[]; addToCart: (id: string, quantity: number) => void } | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const addToCart = (id: string, quantity: number) => {
    setCart(prev => [...prev, { id, quantity }]);
    alert('Added to cart!');
  };
  return <CartContext.Provider value={{ cart, addToCart }}>{children}</CartContext.Provider>;
};
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
