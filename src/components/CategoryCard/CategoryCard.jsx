import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import './CategoryCard.css';

const CategoryCard = ({ category, style }) => {
  return (
    <Link to={`/mahsulotlar?category=${category.id}`} className="category-card" style={style}>
      <div className="category-image-wrapper">
        {category.image ? (
          <img src={category.image} alt={category.name} className="category-image" loading="lazy" />
        ) : (
          <div className="category-image category-image--placeholder" aria-hidden="true"><ShoppingBag size={36} strokeWidth={1.25} /></div>
        )}
        <div className="category-overlay" />
      </div>
      <div className="category-info">
        <h3>{category.name}</h3>
        {typeof category.product_count === 'number' && <p>{category.product_count} mahsulot</p>}
      </div>
    </Link>
  );
};

export default CategoryCard;
