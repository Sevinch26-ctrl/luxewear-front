import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

const LOCAL_KEY = 'lw_guest_wishlist';

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function writeLocal(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

/**
 * Sevimlilar — Savat bilan bir xil naqsh: tizimga kirgan foydalanuvchida
 * serverda saqlanadi (veb-sayt <-> Telegram Mini App sinxronizatsiyasi shu
 * orqali), mehmon holatida localStorage'da.
 */
export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState(() => readLocal());
  const [loading, setLoading] = useState(false);
  const mergedRef = useRef(false);

  const fetchServerWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/wishlist/');
      setWishlistItems(data);
    } catch (err) {
      console.error('Sevimlilarni yuklab bo\'lmadi', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      mergedRef.current = false;
      setWishlistItems(readLocal());
      return;
    }

    async function mergeThenFetch() {
      const localItems = readLocal();
      if (!mergedRef.current && localItems.length > 0) {
        mergedRef.current = true;
        for (const item of localItems) {
          try {
            await API.post(`/wishlist/${item.product_id}`);
          } catch (err) {
            console.warn('Mahalliy sevimlini serverga ko\'chirishda xato', err);
          }
        }
        writeLocal([]);
      }
      mergedRef.current = true;
      await fetchServerWishlist();
    }
    mergeThenFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const isInWishlist = (productId) => wishlistItems.some((i) => i.product_id === productId);

  const toggleWishlist = async (product) => {
    if (isAuthenticated) {
      const { data } = await API.post(`/wishlist/${product.id}`);
      if (data.status === 'added') {
        await fetchServerWishlist();
      } else {
        setWishlistItems((prev) => prev.filter((i) => i.product_id !== product.id));
      }
      return data.status;
    }

    let status = 'added';
    setWishlistItems((prev) => {
      const exists = prev.some((i) => i.product_id === product.id);
      let updated;
      if (exists) {
        status = 'removed';
        updated = prev.filter((i) => i.product_id !== product.id);
      } else {
        updated = [...prev, { id: `local-${product.id}`, product_id: product.id, product, added_at: new Date().toISOString() }];
      }
      writeLocal(updated);
      return updated;
    });
    return status;
  };

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated) {
      await API.delete(`/wishlist/${productId}`);
    }
    setWishlistItems((prev) => {
      const updated = prev.filter((i) => i.product_id !== productId);
      if (!isAuthenticated) writeLocal(updated);
      return updated;
    });
  };

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, loading, toggleWishlist, isInWishlist, removeFromWishlist, refetch: fetchServerWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
