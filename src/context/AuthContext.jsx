import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { isTelegramWebApp, getTelegramInitData } from '../lib/telegram';

export const AuthContext = createContext();

/** Qulaylik uchun: useContext(AuthContext) o'rniga useAuth() */
export const useAuth = () => useContext(AuthContext);

function readErrorMessage(error, fallback) {
  // FastAPI xatolari {"detail": "..."} shaklida keladi (ba'zan validatsiya
  // xatoliklarida detail ro'yxat bo'lishi mumkin — shu holatni ham hisobga olamiz)
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
}

function persistSession(access_token, user) {
  localStorage.setItem('token', access_token);
  localStorage.setItem('user', JSON.stringify(user));
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      // 1) Telegram Mini App ichida ochilgan bo'lsa — initData orqali
      //    avtomatik autentifikatsiya (foydalanuvchi hech narsa bosmasdan).
      if (isTelegramWebApp()) {
        try {
          const initData = getTelegramInitData();
          const { data } = await API.post('/auth/telegram', { init_data: initData });
          if (!cancelled) {
            persistSession(data.access_token, data.user);
            setUser(data.user);
            setIsAuthenticated(true);
          }
          return;
        } catch (err) {
          // initData eskirgan/yaroqsiz bo'lsa oddiy oqimga tushamiz (quyida)
          console.warn('Telegram auth muvaffaqiyatsiz, oddiy tekshiruvga o\'tilmoqda', err);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      // 2) Oddiy veb-sayt — saqlangan tokenni serverda tekshirib chiqamiz
      //    (shunchaki localStorage'ga ishonib qolmaymiz — token muddati
      //    o'tgan yoki hisob bloklangan bo'lishi mumkin).
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await API.get('/users/profile');
          if (!cancelled) {
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            setIsAuthenticated(true);
          }
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      if (!cancelled) setLoading(false);
    }

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      persistSession(data.access_token, data.user);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: readErrorMessage(error, 'Kirishda xatolik yuz berdi') };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const { data } = await API.post('/auth/register', { name, email, password, phone });
      persistSession(data.access_token, data.user);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: readErrorMessage(error, "Ro'yxatdan o'tishda xatolik yuz berdi") };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  /** Profil tahrirlangach yoki Telegram ulangach lokal holatni yangilash uchun */
  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
