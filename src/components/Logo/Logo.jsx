import React from 'react';
import './Logo.css';

/**
 * LuxeWear monogram — nozik chiziqli doira, "L" belgisi va imzo uslubidagi
 * pastki chiziq. `animated` true bo'lganda chiziqlar "chizilib" ko'rinadi
 * (Intro komponentida), aks holda statik holatda ko'rsatiladi (Header'da).
 * Barcha yo'llar `pathLength="100"` bilan normallashtirilgan, shu bois
 * CSS animatsiyasi geometriyadan qat'i nazar bir xil ishlaydi.
 */
export default function Logo({ animated = false, size = 96, className = '' }) {
  return (
    <svg
      className={`lw-logo ${animated ? 'lw-logo--animated' : ''} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="LuxeWear"
    >
      <circle
        className="lw-logo__ring"
        cx="100" cy="100" r="74"
        stroke="currentColor" strokeWidth="1.5"
      />
      <path
        className="lw-logo__mark"
        d="M 76 60 L 76 128 Q 76 134 82 134 L 130 134"
        stroke="currentColor" strokeWidth="6"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        className="lw-logo__flourish"
        d="M 62 152 Q 100 166 138 152"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle className="lw-logo__dot" cx="138" cy="152" r="3.5" fill="currentColor" />
    </svg>
  );
}
