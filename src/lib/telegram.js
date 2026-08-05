/**
 * LuxeWear Frontend — Telegram Mini App yordamchi funksiyalari
 * `index.html` ga qo'shilgan https://telegram.org/js/telegram-web-app.js
 * skripti orqali `window.Telegram.WebApp` global obyektini taqdim etadi.
 * Oddiy brauzerda ochilganda bu obyekt mavjud bo'lmaydi — shu bois har bir
 * funksiya uni yo'qligini xavfsiz tekshiradi va veb-saytda hech narsa
 * buzilmaydi.
 */

export function getTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
}

/**
 * Telegram Mini App SDK'ni dinamik yuklaydi (https://telegram.org/js/telegram-web-app.js).
 * <head> dagi `defer` skript o'rniga — kritik render yo'lida main thread'ni
 * band qilmaslik uchun faqat kerak bo'lganda (TelegramProvider bir marta
 * chaqiradi, brauzer bo'sh qolganda) yuklanadi.
 *
 * Haqiqiy Telegram Mini App ichida SDK'ni Telegram klientining O'ZI skriptlar
 * ishga tushishidan oldin in'ektsiya qiladi — bu holda `window.Telegram.WebApp`
 * allaqachon mavjud bo'ladi va funksiya darhol tayyor deb qaytadi.
 */
let sdkPromise = null;
export function ensureTelegramWebAppScript() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (getTelegramWebApp()) return Promise.resolve(getTelegramWebApp());

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      script.onload = () => resolve(getTelegramWebApp());
      // SDK yuklana olmasa (tarmoq xatosi va h.k.) ilovani osib qo'ymaymiz —
      // Telegram'ga bog'liq funksiyalar xavfsiz tarzda "o'chirilgan" qoladi.
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }

  return sdkPromise;
}

/** Chinakam Telegram Mini App ichida ochilganmi (shunchaki skript yuklanishi kifoya emas — initData ham bo'lishi kerak) */
export function isTelegramWebApp() {
  const wa = getTelegramWebApp();
  return !!(wa && wa.initData);
}

export function getTelegramInitData() {
  const wa = getTelegramWebApp();
  return wa && wa.initData ? wa.initData : null;
}

export function getTelegramUser() {
  const wa = getTelegramWebApp();
  return wa && wa.initDataUnsafe ? wa.initDataUnsafe.user : null;
}

/** Mini App SDK'ni ishga tushirish — App.jsx da bir marta chaqiriladi */
export function initTelegramWebApp() {
  const wa = getTelegramWebApp();
  if (!wa) return null;
  try {
    wa.ready();
    wa.expand();
    if (wa.setHeaderColor) {
      try { wa.setHeaderColor('secondary_bg_color'); } catch (_) { /* eski versiya */ }
    }
    if (wa.disableVerticalSwipes) {
      try { wa.disableVerticalSwipes(); } catch (_) { /* ba'zi versiyalarda yo'q */ }
    }
  } catch (_) {
    // Eski Telegram klient versiyalarida ayrim metodlar bo'lmasligi mumkin — jim o'tkazamiz
  }
  return wa;
}

export function telegramColorScheme() {
  const wa = getTelegramWebApp();
  return wa && wa.colorScheme ? wa.colorScheme : null; // 'light' | 'dark'
}

export function hapticImpact(style = 'light') {
  const wa = getTelegramWebApp();
  try { wa && wa.HapticFeedback && wa.HapticFeedback.impactOccurred(style); } catch (_) { /* noop */ }
}

export function hapticNotification(type = 'success') {
  const wa = getTelegramWebApp();
  try { wa && wa.HapticFeedback && wa.HapticFeedback.notificationOccurred(type); } catch (_) { /* noop */ }
}

/**
 * Telegram'ning orqaga qaytish tugmasini boshqarish uchun kichik yordamchi.
 * Cleanup funksiyasini qaytaradi (useEffect ichida ishlatish uchun qulay).
 */
export function useTelegramBackButtonHandler(wa, onBack) {
  if (!wa || !wa.BackButton) return () => {};
  wa.BackButton.show();
  wa.BackButton.onClick(onBack);
  return () => {
    try {
      wa.BackButton.offClick(onBack);
      wa.BackButton.hide();
    } catch (_) { /* noop */ }
  };
}
