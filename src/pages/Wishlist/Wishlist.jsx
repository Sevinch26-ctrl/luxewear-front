import React, { useContext } from 'react';
import { WishlistContext } from '../../context/WishlistContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const { wishlistItems, loading } = useContext(WishlistContext);

  if (loading) {
    return (
      <div className="container section">
        <div className="products-grid-main">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '3/4' }} />
          ))}
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container section empty-state text-center">
        <div className="empty-state__icon"><Heart size={48} strokeWidth={1.25} /></div>
        <h2>Sevimlilar ro'yxati bo'sh</h2>
        <p>Sizga yoqqan mahsulotlarni yurakchani bosib saqlab qo'yishingiz mumkin</p>
        <Link to="/mahsulotlar" className="btn btn-primary" style={{ marginTop: 20 }}>Katalogga o'tish</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">Sevimlilar ({wishlistItems.length})</h1>
      <div className="products-grid-main">
        {wishlistItems.map((item, idx) => (
          <ProductCard key={item.id} product={item.product} style={{ '--stagger-index': idx }} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
