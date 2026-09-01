'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.items;
    case 'ADD': {
      const existing = state.find(
        (i) => i.id === action.item.id && i.size === action.item.size && i.color === action.item.color
      );
      if (existing) {
        return state.map((i) =>
          i.id === action.item.id && i.size === action.item.size && i.color === action.item.color
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...state, { ...action.item, qty: 1 }];
    }
    case 'REMOVE':
      return state.filter((i) => i._cartKey !== action._cartKey);
    case 'UPDATE_QTY':
      return state.map((i) =>
        i._cartKey === action._cartKey ? { ...i, qty: action.qty } : i
      ).filter((i) => i.qty > 0);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('inzzout_cart');
      if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) });
    } catch (_) {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('inzzout_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size, color) => {
    const _cartKey = `${product.id}_${size}_${color}`;
    dispatch({ type: 'ADD', item: { ...product, size, color, _cartKey } });
  };

  const removeFromCart = (_cartKey) => dispatch({ type: 'REMOVE', _cartKey });

  const updateQty = (_cartKey, qty) => dispatch({ type: 'UPDATE_QTY', _cartKey, qty });

  const clearCart = () => dispatch({ type: 'CLEAR' });

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
