import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import API from '../../services/api';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await API.get('/products/', { params: { search: q, size: 24 } });
      setResults(data.items || []);
    } catch (err) {
      console.error('Qidirishda xato', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sahifa "q" bilan ochilganda darhol qidirish
  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Yozayotganda debounce bilan avtomatik qidirish (live search)
  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== initialQuery) {
        const next = new URLSearchParams(searchParams);
        if (query) next.set('q', query); else next.delete('q');
        setSearchParams(next, { replace: true });
        runSearch(query);
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="container section search-page">
      <div className="search-box">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nima qidiryapsiz? (masalan: ko'ylak, hijob...)"
            className="search-input"
            autoFocus
          />
          <button type="submit" className="btn btn-primary">Qidirish</button>
        </form>
      </div>

      {loading ? (
        <div className="products-grid-main">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '3/4' }} />
          ))}
        </div>
      ) : searched ? (
        <>
          <h2 className="search-results-title">
            "{query}" uchun {results.length > 0 ? `${results.length} ta natija` : 'natija topilmadi'}
          </h2>
          {results.length === 0 ? (
            <div className="empty-state text-center">
              <p>Hech narsa topilmadi. Boshqa so'z bilan qidirib ko'ring.</p>
            </div>
          ) : (
            <div className="products-grid-main">
              {results.map((p, idx) => (
                <ProductCard key={p.id} product={p} style={{ '--stagger-index': idx }} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="empty-hint">Qidiruvni boshlash uchun kamida 2 ta belgi kiriting.</p>
      )}
    </div>
  );
};

export default Search;
