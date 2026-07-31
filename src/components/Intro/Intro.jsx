import React, { useState, useEffect, useRef } from 'react';
import Logo from '../Logo/Logo';
import './Intro.css';

const SESSION_KEY = 'lw_intro_shown';

/**
 * Premium brend tanishtiruv ekrani — sahifa birinchi ochilganda ~2.5-2.8
 * soniya davomida ko'rsatiladi, keyin bosh sahifaga silliq o'tadi.
 *
 * Ketma-ketlik: fon (subtle blur) -> logotip "chizilishi" -> yorqinlik
 * effekti -> brend nomi va shior -> yuklash indikatori -> chiqish.
 *
 * `onFinish` — animatsiya tugagach chaqiriladi; App.jsx shu orqali bosh
 * sahifaning kirish animatsiyalarini (navbar, hero va h.k.) ishga tushiradi,
 * shunda ular Intro ortida "yashirincha" o'ynalib bo'lmay, foydalanuvchi
 * ularni haqiqatan ko'radi.
 *
 * Bitta brauzer sessiyasida faqat bir marta ko'rsatiladi (sessionStorage).
 */
export default function Intro({ onFinish }) {
  const alreadyShown = useRef(
    typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1'
  ).current;
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  const [phase, setPhase] = useState('drawing');

  useEffect(() => {
    if (alreadyShown) {
      onFinish();
      return;
    }
    sessionStorage.setItem(SESSION_KEY, '1');

    if (reducedMotion) {
      // Harakatni kamaytirish talab qilinganda — chizish animatsiyasisiz,
      // faqat qisqa, bir zumlik brend ko'rinishi.
      setPhase('text');
      const t = setTimeout(onFinish, 500);
      return () => clearTimeout(t);
    }

    const timers = [
      setTimeout(() => setPhase('glow'), 1500),
      setTimeout(() => setPhase('text'), 1600),
      setTimeout(() => setPhase('loading'), 2150),
      setTimeout(() => setPhase('exiting'), 2500),
      setTimeout(() => onFinish(), 2850),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (alreadyShown) return null;

  const textVisible = phase === 'text' || phase === 'loading' || phase === 'exiting';
  const loaderVisible = phase === 'loading' || phase === 'exiting';
  const glowing = (phase === 'glow' || phase === 'text' || phase === 'loading' || phase === 'exiting') && !reducedMotion;

  return (
    <div
      className={`intro ${phase === 'exiting' ? 'intro--exiting' : ''} ${reducedMotion ? 'intro--reduced' : ''}`}
      role="status"
      aria-label="LuxeWear yuklanmoqda"
    >
      <div className="intro__bg" aria-hidden="true" />
      <div className="intro__glow-orb intro__glow-orb--1" aria-hidden="true" />
      <div className="intro__glow-orb intro__glow-orb--2" aria-hidden="true" />

      <div className="intro__content">
        <div className="intro__logo-wrap">
          <Logo animated={!reducedMotion} size={104} className={glowing ? 'lw-logo--glow' : ''} />
        </div>

        <div className={`intro__brand ${textVisible ? 'intro__brand--visible' : ''}`}>
          <h1 className="intro__name">LuxeWear</h1>
          <p className="intro__slogan">Nafislik har bir tafsilotda</p>
        </div>

        <div className={`intro__loader ${loaderVisible ? 'intro__loader--visible' : ''}`} aria-hidden="true">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
