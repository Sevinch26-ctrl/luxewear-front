import React from 'react';
import { Shirt } from 'lucide-react';
import { colorNameToHex } from '../../utils/colorMap';
import './ProductImagePlaceholder.css';

/**
 * Mahsulotning hali fotosurati yuklanmagan bo'lsa ko'rsatiladigan placeholder.
 * Tashqi stok-foto havolalar ishlatilmaydi (huquqiy va ishonchlilik nuqtai
 * nazaridan) — buning o'rniga mahsulotning haqiqiy rangiga (bazadagi
 * `colors[0]`) mos, brendga mos gradient + kiyim ikonkasi chiziladi. Admin
 * mahsulotga rasm yuklagach (Mahsulotlar sahifasi), bu joyni haqiqiy surat
 * avtomatik egallaydi.
 */
const ProductImagePlaceholder = ({ colorName, className = '' }) => {
  const hex = colorNameToHex(colorName);

  return (
    <div
      className={`product-image-placeholder ${className}`}
      style={{ '--placeholder-color': hex }}
      aria-hidden="true"
    >
      <Shirt className="product-image-placeholder__icon" strokeWidth={1.25} />
    </div>
  );
};

export default ProductImagePlaceholder;
