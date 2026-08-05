import React, { createContext, useEffect, useState } from 'react';
import { initTelegramWebApp, ensureTelegramWebAppScript, isTelegramWebApp, telegramColorScheme, getTelegramUser } from '../lib/telegram';

export const TelegramContext = createContext({
  isTelegram: false,
  webApp: null,
  tgUser: null,
  colorScheme: null,
});

/**
 * Ilova Telegram Mini App ichida ochilganda SDK'ni ishga tushiradi va
 * boshqa komponentlarga (masalan, "email bilan kirish" formasini
 * yashirish yoki haptik teginish qo'shish uchun) shu holatni taqdim etadi.
 * Haqiqiy autentifikatsiya (backend bilan) AuthContext'da amalga oshadi.
 */
export const TelegramProvider = ({ children }) => {
  const [state, setState] = useState({
    isTelegram: false,
    webApp: null,
    tgUser: null,
    colorScheme: null,
  });

  useEffect(() => {
    let cancelled = false;

    // SDK'ni kritik render yo'lidan chiqarish: birinchi bo'sh qolganda
    // (idle) yuklashni boshlaymiz — ertaroq emas.
    const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
    const idleId = schedule(async () => {
      try {
        await ensureTelegramWebAppScript();
        if (cancelled) return;
        const wa = initTelegramWebApp();
        if (wa) {
          setState({
            isTelegram: isTelegramWebApp(),
            webApp: wa,
            tgUser: getTelegramUser(),
            colorScheme: telegramColorScheme(),
          });
        }
      } catch (_) {
        // SDK mavjud bo'lmasa ham ilova oddiy sayt sifatida ishlayveradi.
      }
    });

    return () => {
      cancelled = true;
      if (idleId && typeof window !== 'undefined' && window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  return (
    <TelegramContext.Provider value={state}>
      {children}
    </TelegramContext.Provider>
  );
};
