import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import './Carousel.css';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 50;

/**
 * Bosh sahifaning "Hero" bo'limi sifatida ishlatiladi: slaydlar avtomatik
 * almashadi (sichqoncha ustida yoki barmoq bilan ushlab turilganda
 * to'xtaydi), pastdagi indikatorlar keyingi slaydgacha qolgan vaqtni
 * chiziq sifatida to'ldirib ko'rsatadi. Mobil qurilmalarda barmoq bilan
 * suryish (swipe) orqali ham almashtirish mumkin.
 */
const Carousel = ({ items = [], ready = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, items.length, currentIndex]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) nextSlide(); else prevSlide();
    }
    touchStartX.current = null;
    setPaused(false);
  };

  if (!items.length) return null;

  return (
    <div
      className={`carousel ${ready ? 'carousel--ready' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="carousel-inner"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div className="carousel-item" key={index}>
            <div className="carousel-content">
              <span className="carousel-eyebrow">{item.eyebrow || 'LuxeWear'}</span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div className="carousel-buttons">
                <Link to={item.primaryLink || '/mahsulotlar?sort=new'} className="btn btn-primary carousel-btn carousel-btn--1">
                  {item.primaryLabel || 'Xarid qilish'}
                </Link>
                <Link to={item.secondaryLink || '/kategoriyalar'} className="btn btn-outline carousel-btn carousel-btn--2">
                  {item.secondaryLabel || 'Katalogni ko\'rish'}
                </Link>
              </div>
            </div>
            <div className="carousel-image">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchpriority={index === 0 ? 'high' : 'auto'}
                />
              ) : (
                <div className="carousel-image--placeholder" aria-hidden="true"><Sparkles size={40} strokeWidth={1.25} /></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button className="carousel-control prev" onClick={prevSlide} aria-label="Oldingi"><ChevronLeft size={22} /></button>
          <button className="carousel-control next" onClick={nextSlide} aria-label="Keyingi"><ChevronRight size={22} /></button>

          <div className="carousel-indicators">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`${idx + 1}-slaydga o'tish`}
              >
                {idx === currentIndex && !paused && (
                  <span className="dot-fill" key={`fill-${currentIndex}`} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;
