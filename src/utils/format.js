export const formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const truncateText = (text, length) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/** Mahsulot so'nggi 14 kun ichida qo'shilgan bo'lsa "YANGI" nishonini ko'rsatish uchun */
export const isNewProduct = (createdAt) => {
  if (!createdAt) return false;
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 14;
};
