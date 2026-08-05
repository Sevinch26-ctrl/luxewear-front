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
