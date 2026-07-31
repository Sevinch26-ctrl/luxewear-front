import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Sparkles, Undo2, Bot, ArrowRight } from 'lucide-react';
import Carousel from '../../components/Carousel/Carousel';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import API from '../../services/api';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './Home.css';

const HERO_SLIDES = [
  {
    eyebrow: "2026 Kolleksiyasi",
    title: 'Nafislik har bir tafsilotda',
    description: "Yangi mavsum uchun eng sara liboslar to'plami — o'zingizga mos uslubni toping.",
    primaryLabel: 'Xarid qilish',
    primaryLink: '/mahsulotlar?sort=new',
    secondaryLabel: 'Katalogni ko\'rish',
    secondaryLink: '/kategoriyalar',
  },
  {
    eyebrow: 'Maxsus taklif',
    title: 'Oqshom liboslari to\'plami',
    description: 'Maxsus kunlar uchun takrorlanmas ko\'rinish va nafislik — 20% gacha chegirma bilan.',
    primaryLabel: 'Aksiyalarni ko\'rish',
    primaryLink: '/mahsulotlar?sale=true',
    secondaryLabel: 'Batafsil',
    secondaryLink: '/kategoriyalar',
  },
];

function SkeletonGrid({ count, aspect = '3/4' }) {
  return (
    <div className="products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton" style={{ aspectRatio: aspect }} />
          <div className="skeleton" style={{ height: 14, marginTop: 12, width: '60%' }} />
          <div className="skeleton" style={{ height: 16, marginTop: 8, width: '40%' }} />
        </div>
      ))}
    </div>
  );
}

const Home = ({ ready = true }) => {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [catRef, catVisible] = useScrollReveal({ threshold: 0.15 });
  const [featRef, featVisible] = useScrollReveal({ threshold: 0.1 });
  const [promoRef, promoVisible] = useScrollReveal({ threshold: 0.2 });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [catRes, featRes, newRes] = await Promise.all([
          API.get('/categories/'),
          API.get('/products/', { params: { is_featured: true, size: 8 } }),
          API.get('/products/', { params: { sort_by: 'created_at', size: 8 } }),
        ]);
        if (cancelled) return;
        setCategories(catRes.data || []);
        setFeatured(featRes.data.items || []);
        setNewArrivals(newRes.data.items || []);
      } catch (err) {
        console.error("Bosh sahifa ma'lumotlarini yuklashda xato", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="home-page">
      <Carousel items={HERO_SLIDES} ready={ready} />

      <section className="features-strip">
        <div className="container features-grid">
          <div className="feature-item">
            <span className="feature-icon"><Truck size={28} strokeWidth={1.5} /></span>
            <h4>Bepul yetkazib berish</h4>
            <p>500,000 so'mdan yuqori xaridlar uchun</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon"><Sparkles size={28} strokeWidth={1.5} /></span>
            <h4>Original mahsulotlar</h4>
            <p>100% sifat kafolati</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon"><Undo2 size={28} strokeWidth={1.5} /></span>
            <h4>Oson qaytarish</h4>
            <p>14 kun ichida qaytarish imkoniyati</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon"><Bot size={28} strokeWidth={1.5} /></span>
            <h4>Telegram orqali xarid</h4>
            <p>Do'konni Telegram botimizda ham oching</p>
          </div>
        </div>
      </section>

      <section className="section container" ref={catRef}>
        <h2 className="section-title">Mashhur Kategoriyalar</h2>
        {loading ? (
          <div className="categories-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '4/5' }} />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className={`categories-grid ${catVisible ? 'is-visible' : ''}`}>
            {categories.slice(0, 3).map((cat, idx) => (
              <CategoryCard key={cat.id} category={cat} style={{ '--stagger-index': idx }} />
            ))}
          </div>
        ) : (
          <p className="empty-hint">Hozircha kategoriyalar qo'shilmagan.</p>
        )}
      </section>

      <section className="section container bg-light" ref={featRef}>
        <div className="section-header">
          <h2 className="section-title">Tanlangan Mahsulotlar</h2>
          <Link to="/mahsulotlar" className="section-link">Barchasini ko'rish <ArrowRight size={15} /></Link>
        </div>
        {loading ? (
          <SkeletonGrid count={4} />
        ) : featured.length > 0 ? (
          <div className="products-grid">
            {featured.map((p, idx) => (
              <ProductCard key={p.id} product={p} style={{ '--stagger-index': idx }} />
            ))}
          </div>
        ) : (
          <p className="empty-hint">Hozircha tanlangan mahsulotlar yo'q.</p>
        )}
      </section>

      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Yangi Kelganlar</h2>
          <Link to="/mahsulotlar?sort=new" className="section-link">Barchasini ko'rish <ArrowRight size={15} /></Link>
        </div>
        {loading ? (
          <SkeletonGrid count={4} />
        ) : newArrivals.length > 0 ? (
          <div className="products-grid">
            {newArrivals.map((p, idx) => (
              <ProductCard key={p.id} product={p} style={{ '--stagger-index': idx }} />
            ))}
          </div>
        ) : (
          <p className="empty-hint">Hozircha mahsulotlar yo'q.</p>
        )}
      </section>

      <section className={`promo-banner ${promoVisible ? 'is-visible' : ''}`} ref={promoRef}>
        <div className="container promo-content">
          <h2>Mavsumiy Chegirmalar!</h2>
          <p>Tanlangan kolleksiyalarga 50% gacha chegirmalar.</p>
          <Link to="/mahsulotlar?sale=true" className="btn btn-primary btn-lg">Hozir xarid qilish</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
