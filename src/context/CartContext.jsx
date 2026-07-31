import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

const LOCAL_KEY = 'lw_guest_cart';

function readLocalCart() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function writeLocalCart(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

/**
 * Savat — tizimga kirgan foydalanuvchida SERVERDA saqlanadi (shu bois
 * veb-sayt va Telegram Mini App bir xil savatni ko'radi — sinxronizatsiya
 * shu orqali amalga oshadi). Mehmon (login qilmagan) holatda localStorage'da
 * saqlanadi va tizimga kirilganda avtomatik serverdagi savatga qo'shiladi.
 */
export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState(() => readLocalCart());
  const [loading, setLoading] = useState(false);
  const mergedRef = useRef(false);

  const fetchServerCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/cart/');
      setCartItems(data);
    } catch (err) {
      console.error('Savatni yuklab bo\'lmadi', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      mergedRef.current = false;
      setCartItems(readLocalCart());
      return;
    }

    async function mergeThenFetch() {
      const localItems = readLocalCart();
      if (!mergedRef.current && localItems.length > 0) {
        mergedRef.current = true;
        setLoading(true);
        for (const item of localItems) {
          try {
            await API.post('/cart/', {
              product_id: item.product_id,
              variant_id: item.variant_id || null,
              quantity: item.quantity,
            });
          } catch (err) {
            console.warn('Mahalliy savat elementini serverga ko\'chirishda xato', err);
          }
        }
        writeLocalCart([]);
      }
      mergedRef.current = true;
      await fetchServerCart();
    }
    mergeThenFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const addToCart = async (product, variantId = null, quantity = 1) => {
    if (isAuthenticated) {
      const { data } = await API.post('/cart/', {
        product_id: product.id,
        variant_id: variantId,
        quantity,
      });
      setCartItems((prev) => {
        const idx = prev.findIndex((i) => i.id === data.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = data;
          return copy;
        }
        return [...prev, data];
      });
      return data;
    }

    // Mehmon: lokal holatda saqlash
    let updated;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id && i.variant_id === variantId);
      if (existing) {
        updated = prev.map((i) =>
          i.product_id === product.id && i.variant_id === variantId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        updated = [
          ...prev,
          {
            id: `local-${product.id}-${variantId || 'default'}`,
            product_id: product.id,
            variant_id: variantId,
            quantity,
            product,
            variant: null,
            added_at: new Date().toISOString(),
          },
        ];
      }
      writeLocalCart(updated);
      return updated;
    });
    return updated;
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    if (isAuthenticated) {
      const { data } = await API.put(`/cart/${itemId}`, { quantity });
      setCartItems((prev) => prev.map((i) => (i.id === itemId ? data : i)));
      return;
    }
    setCartItems((prev) => {
      const updated = prev.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      writeLocalCart(updated);
      return updated;
    });
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      await API.delete(`/cart/${itemId}`);
    }
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      if (!isAuthenticated) writeLocalCart(updated);
      return updated;
    });
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await API.delete('/cart/');
    } else {
      writeLocalCart([]);
    }
    setCartItems([]);
  };

  const itemPrice = (item) => {
    if (item.variant && item.variant.selling_price) return item.variant.selling_price;
    return item.product?.final_price ?? item.product?.selling_price ?? 0;
  };

  const cartTotal = cartItems.reduce((total, item) => total + itemPrice(item) * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems, loading, addToCart, removeFromCart, updateQuantity, clearCart,
        cartTotal, cartCount, itemPrice, refetch: fetchServerCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
