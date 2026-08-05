import React, { createContext, useEffect, useState } from 'react';
import { initTelegramWebApp, isTelegramWebApp, telegramColorScheme, getTelegramUser } from '../lib/telegram';

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
    const wa = initTelegramWebApp();
    if (wa) {
      setState({
        isTelegram: isTelegramWebApp(),
        webApp: wa,
        tgUser: getTelegramUser(),
        colorScheme: telegramColorScheme(),
      });
    }
  }, []);

  return (
    <TelegramContext.Provider value={state}>
      {children}
    </TelegramContext.Provider>
  );
};
