import React, { createContext, useContext, useState, useCallback } from "react";
import type { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  customization?: {
    model: string;
    color: string;
    size: string;
    extras?: string[];
  };
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, customization?: CartItem['customization']) => void;
  removeItem: (productId: string, customizationJson?: string) => void;
  updateQuantity: (productId: string, quantity: number, customizationJson?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product, quantity: number = 1, customization?: CartItem['customization']) => {
    setItems((prev) => {
      const custStr = customization ? JSON.stringify(customization) : undefined;
      const existing = prev.find((i) => 
        i.product.id === product.id && 
        JSON.stringify(i.customization) === custStr
      );

      if (existing) {
        return prev.map((i) =>
          (i.product.id === product.id && JSON.stringify(i.customization) === custStr)
            ? { ...i, quantity: i.quantity + quantity } 
            : i
        );
      }
      return [...prev, { product, quantity, customization }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, customizationJson?: string) => {
    setItems((prev) => prev.filter((i) => 
      !(i.product.id === productId && JSON.stringify(i.customization) === customizationJson)
    ));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, customizationJson?: string) => {
    if (quantity <= 0) {
      removeItem(productId, customizationJson);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId && JSON.stringify(i.customization) === customizationJson ? { ...i, quantity } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, isOpen, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
