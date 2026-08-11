import React, { useEffect, useState } from 'react';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import API from '../../services/api';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    API.get('/categories/')
      .then((res) => { if (!cancelled) setCategories(res.data || []); })
      .catch((err) => console.error('Kategoriyalarni yuklashda xato', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="categories-page container section">
      <div className="page-header reveal is-visible">
        <h1>Katalog</h1>
        <p>Barcha mahsulot toifalari</p>
      </div>

      {loading ? (
        <div className="categories-grid-main">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '4/5' }} />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="categories-grid-main">
          {categories.map((cat, idx) => (
            <CategoryCard key={cat.id} category={cat} style={{ '--stagger-index': idx }} />
          ))}
        </div>
      ) : (
        <p className="empty-hint">Hozircha kategoriyalar qo'shilmagan.</p>
      )}
    </div>
  );
};

export default Categories;
