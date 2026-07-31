/**
 * Mahsulot ranglari bazada o'zbekcha nom sifatida saqlanadi (masalan "qora",
 * "zumrad"), CSS rang kodi sifatida emas — shu bois kichik "shvatka"
 * doiralarini chizish uchun nomdan taxminiy HEX kodga moslashtiruvchi jadval.
 * Ro'yxatda yo'q nom uchun neytral kulrang bilan almashtiriladi (funksiya
 * hech qachon "undefined" holatga tushmaydi).
 */
const COLOR_MAP = {
  "qora": "#1a1a1a",
  "oq": "#f8f8f8",
  "kulrang": "#9CA3AF",
  "zumrad": "#10B981",
  "binafsha": "#8B5CF6",
  "dusty pink": "#D8A7B1",
  "pushti": "#F9A8D4",
  "havorang": "#93C5FD",
  "to'q ko'k": "#1E3A5F",
  "shampan": "#F0E4D0",
  "burgundiya": "#7A2436",
  "oltin": "#D4AF37",
  "kumush": "#C0C0C0",
  "qizil": "#DC2626",
  "sariq": "#F59E0B",
  "yashil": "#16A34A",
  "jigarrang": "#78350F",
};

export function colorNameToHex(name) {
  if (!name) return '#D1D5DB';
  const key = name.trim().toLowerCase();
  return COLOR_MAP[key] || '#D1D5DB';
}
