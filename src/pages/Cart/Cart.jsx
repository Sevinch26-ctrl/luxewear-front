import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { formatPrice } from '../../utils/format';
import ProductImagePlaceholder from '../../components/ProductImagePlaceholder/ProductImagePlaceholder';
import './Cart.css';

const Cart = () => {
  const { cartItems, loading, updateQuantity, removeFromCart, cartTotal, itemPrice } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate(isAuthenticated ? '/checkout' : '/kirish?next=/checkout');
  };

  if (loading) {
    return (
      <div className="container section">
        <div className="cart-content">
          <div className="skeleton" style={{ height: 300 }} />
          <div className="skeleton" style={{ height: 220 }} />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container section empty-state text-center reveal is-visible">
        <h2>Savat bo'sh</h2>
        <p>Hali hech qanday mahsulot qo'shmadingiz</p>
        <Link to="/mahsulotlar" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>
          Xarid qilish
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page container section">
      <h1 className="page-title">Savat</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => {
            const product = item.product || {};
            const image = product.images && product.images[0];
            const price = itemPrice(item);
            return (
              <div className="cart-row" key={item.id}>
                <div className="cart-item-info">
                  {image ? <img src={image} alt={product.name} /> : <div className="cart-item-info-placeholder"><ProductImagePlaceholder colorName={item.variant?.color || product.colors?.[0]} /></div>}
                  <div>
                    <Link to={`/mahsulot/${product.id}`}>{product.name}</Link>
                    {item.variant && (
                      <p>{[item.variant.color, item.variant.size].filter(Boolean).join(' / ')}</p>
                    )}
                  </div>
                </div>
                <div className="cart-row-price">{formatPrice(price)}</div>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Kamaytirish">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Oshirish">+</button>
                </div>
                <div className="cart-row-total">{formatPrice(price * item.quantity)}</div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)} aria-label="O'chirish"><X size={16} /></button>
              </div>
            );
          })}
        </div>

        <div className="cart-summary glass-panel">
          <h3>Buyurtma xulosasi</h3>
          <div className="summary-row">
            <span>Jami:</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div className="summary-row">
            <span>Yetkazib berish:</span>
            <span>Bepul</span>
          </div>
          <hr className="divider" />
          <div className="summary-row total">
            <span>To'lash uchun:</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <button className="btn btn-primary full-width" onClick={handleCheckout}>Buyurtma berish</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
