// Production'da .env faylida VITE_API_URL orqali sozlanadi (masalan
// https://api.luxewear.uz/api/v1). Lokal ishlab chiqishda standart qiymat ishlatiladi.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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
