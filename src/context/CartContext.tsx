import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  promoCode: string;
  promoDiscount: number;
  promoError: string | null;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  totalItemsCount: number;
  freeShippingThreshold: number;
  amountUntilFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'velora_cart_items';
const WISHLIST_KEY = 'velora_wishlist';
const FREE_SHIPPING_THRESHOLD = 150000; // 150 000 ₸

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  }, [items]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.error('Failed to save wishlist:', err);
    }
  }, [wishlist]);

  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, product.stock);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        productId: product.id,
        title: product.title,
        price: product.price,
        size,
        color,
        quantity: Math.min(quantity, product.stock),
        image: product.images[0] || '',
        maxStock: product.stock,
      };
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size && item.color === color) {
          return {
            ...item,
            quantity: Math.min(quantity, item.maxStock || 99),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size && item.color === color)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode('');
    setPromoDiscount(0);
    setPromoError(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return false;

    if (clean === 'VELORA10' || clean === 'WELCOME10') {
      setPromoCode(clean);
      setPromoDiscount(0.1); // 10% discount
      setPromoError(null);
      return true;
    } else if (clean === 'VIP15') {
      setPromoCode(clean);
      setPromoDiscount(0.15); // 15% discount
      setPromoError(null);
      return true;
    } else {
      setPromoError('Недействительный промокод');
      return false;
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoError(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * promoDiscount);
  const shippingAmount = subtotal > 0 && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (subtotal > 0 ? 3500 : 0);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        promoCode,
        promoDiscount,
        promoError,
        applyPromoCode,
        removePromoCode,
        subtotal,
        discountAmount,
        shippingAmount,
        totalAmount,
        totalItemsCount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountUntilFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
