// Production'da .env faylida VITE_API_URL orqali sozlanadi (masalan
// https://api.luxewear.uz/api/v1). Lokal ishlab chiqishda standart qiymat ishlatiladi.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Backend'ning "domen ildizi" (masalan https://api.luxewear.uz), API_URL'dan
// "/api/v1" qismini olib tashlab hisoblanadi.
export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Mahsulot/kategoriya rasmlari bazada NISBIY yo'l sifatida saqlanadi
 * (masalan "/static/uploads/products/xxx.jpg"). Sayt va backend ODATDA
 * alohida domenlarda joylashtiriladi — shuning uchun bunday yo'lni
 * to'g'ridan-to'g'ri <img src> sifatida ishlatib bo'lmaydi, chunki brauzer
 * uni saytning O'ZI domeniga nisbatan hal qiladi va rasm "topilmadi" bo'lib
 * qoladi (Telegram Mini App ichida ham xuddi shunday). Shu funksiya nisbiy
 * yo'llarni backend domeniga bog'laydi; to'liq (http/https/data) URL'lar
 * o'zgarishsiz qaytariladi.
 */
export function getImageUrl(path) {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Admin panel endi ALOHIDA sayt sifatida joylashtiriladi (bu yerdan faqat
// tashqi havola sifatida ochiladi — sessiyalar ulashilmaydi, xodim u yerda
// alohida tizimga kirishi kerak bo'ladi).
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

// Eslatma: asosiy dizayn tizimi src/styles/variables.css da (CSS
// o'zgaruvchilari sifatida, mavzuga qarab moslashadi). Bu obyekt faqat
// CSS o'zgaruvchisi ishlatib bo'lmaydigan kamdan-kam JS holatlar uchun.
export const COLORS = {
  primary: '#8B5CF6',
  accent: '#D8A7B1',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Telegram bot username — oldin kodda qattiq yozilgan edi ("luxewear_bot"),
// bu esa boshqa (noto'g'ri) botga yo'naltirishga sabab bo'lgan. Endi .env
// faylidagi VITE_TELEGRAM_BOT_USERNAME orqali sozlanadi — @BotFather'dan
// olingan HAQIQIY bot username'ini shu yerga yozing (@ belgisisiz).
export const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'luxewear_bot';
export const TELEGRAM_BOT_URL = `https://t.me/${TELEGRAM_BOT_USERNAME}`;
