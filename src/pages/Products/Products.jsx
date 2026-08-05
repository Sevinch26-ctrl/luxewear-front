import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import API from '../../services/api';
import './Products.css';

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Yangi kelganlar' },
  { value: 'price_asc', label: 'Arzonlari oldin' },
  { value: 'price_desc', label: 'Qimmatlari oldin' },
  { value: 'name', label: 'Nomi bo\'yicha' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sort') === 'new' ? 'created_at' : (searchParams.get('sort') || 'created_at');
  const categoryId = searchParams.get('category') || '';
  const onSale = searchParams.get('sale') === 'true';
  const search = searchParams.get('q') || '';
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  useEffect(() => {
    API.get('/categories/').then((res) => setCategories(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 12, sort_by: sortBy };
      if (categoryId) params.category_id = categoryId;
      if (onSale) params.on_sale = true;
      if (search) params.search = search;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      const { data } = await API.get('/products/', { params });
      setProducts(Array.isArray(data.items) ? data.items : []);
      setPagination({ total: data.total, pages: data.pages });
    } catch (err) {
      console.error('Mahsulotlarni yuklashda xato', err);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, categoryId, onSale, search, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const toggleCategory = (id) => {
    updateParam('category', categoryId === String(id) ? '' : String(id));
  };

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('min_price', minPrice); else next.delete('min_price');
    if (maxPrice) next.set('max_price', maxPrice); else next.delete('max_price');
    next.delete('page');
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="products-page container section">
      <div className="products-layout">
        <aside className="filters-sidebar">
          <h3>Filtrlar</h3>

          <div className="filter-group">
            <h4>Narx (so'm)</h4>
            <div className="price-inputs">
              <input type="number" placeholder="Dan" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <input type="number" placeholder="Gacha" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>

          {categories.length > 0 && (
            <div className="filter-group">
              <h4>Kategoriya</h4>
              {categories.map((cat) => (
                <label key={cat.id} className="filter-checkbox">
                  <input type="checkbox" checked={categoryId === String(cat.id)} onChange={() => toggleCategory(cat.id)} />
                  {cat.name}
                </label>
              ))}
            </div>
          )}

          <div className="filter-group">
            <label className="filter-checkbox">
              <input type="checkbox" checked={onSale} onChange={(e) => updateParam('sale', e.target.checked ? 'true' : '')} />
              Faqat aksiyadagilar
            </label>
          </div>

          <button className="btn btn-primary full-width" onClick={applyPriceFilter}>Qo'llash</button>
        </aside>

        <div className="products-content">
          <div className="products-header">
            <p>{loading ? 'Yuklanmoqda...' : `Jami: ${pagination.total} mahsulot`}</p>
            <div className="sort-by">
              <label>Saralash: </label>
              <select value={sortBy} onChange={(e) => updateParam('sort', e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="products-grid-main">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: '3/4' }} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid-main">
              {products.map((prod, idx) => (
                <ProductCard key={prod.id} product={prod} style={{ '--stagger-index': idx % 12 }} />
              ))}
            </div>
          ) : (
            <p className="empty-hint">Ushbu filtrlar bo'yicha mahsulot topilmadi.</p>
          )}

          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
