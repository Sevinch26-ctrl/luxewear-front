import axios from 'axios';
import { API_URL } from '../utils/constants';
import { isTelegramWebApp } from '../lib/telegram';

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Backend shu sarlavha orqali buyurtma manbasini (website/telegram_miniapp)
  // aniqlaydi — qarang: backend/app/api/v1/orders.py -> _resolve_source
  if (isTelegramWebApp()) {
    config.headers['X-Client'] = 'telegram-miniapp';
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Telegram Mini App ichida "login" sahifasi email formasi o'rniga
      // avtomatik qayta autentifikatsiyaga harakat qiladi (Login.jsx'ga qarang),
      // shu bois bu yerdagi yo'naltirish u yerda ham xavfsiz.
      const loginPath = '/kirish';
      if (!isTelegramWebApp() && window.location.pathname !== loginPath) {
        // Foydalanuvchi qayerda bo'lsa ("next"), login'dan keyin AYNAN o'sha
        // joyga qaytarish uchun — masalan checkout'da tizimdan chiqib qolgan
        // bo'lsa, qaytadan kirgach yana boshidan savat/checkout'ga
        // yurishga majbur bo'lmasin.
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `${loginPath}?next=${next}`;
      }
    }
    return Promise.reject(error);
  }
);

export default API;
