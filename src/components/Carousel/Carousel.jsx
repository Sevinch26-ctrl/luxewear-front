import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import './Carousel.css';

/**
 * Bosh sahifaning "Hero" bo'limi sifatida ishlatiladi: slaydlar avtomatik
 * almashadi (sichqoncha ustida to'xtaydi), va `ready` true bo'lgach
 * fade+scale bilan ko'rinadi, tugmalar esa ozgina kechikib paydo bo'ladi.
 */
const Carousel = ({ items = [], ready = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [paused, items.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  if (!items.length) return null;

  return (
    <div
      className={`carousel ${ready ? 'carousel--ready' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
                <img src={item.image} alt={item.title} />
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
              <span
                key={idx}
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;
