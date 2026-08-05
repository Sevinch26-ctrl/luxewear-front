import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Check } from 'lucide-react';
import { formatPrice, isNewProduct } from '../../utils/format';
import { colorNameToHex } from '../../utils/colorMap';
import { getImageUrl } from '../../utils/constants';
import cartSuccessAnim from '../../assets/lottie/cart-success.json';
import heartPopAnim from '../../assets/lottie/heart-pop.json';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import { hapticImpact, hapticNotification } from '../../lib/telegram';
import ProductImagePlaceholder from '../ProductImagePlaceholder/ProductImagePlaceholder';
import './ProductCard.css';

// lottie-react (ichida lottie-web dvigateli) Bosh sahifadagi ProductCard
// orqali kritik yuklash yo'liga kirib qolmasligi uchun — faqat foydalanuvchi
// "sevimlilarga qo'shish" yoki "savatga qo'shish" tugmasini bosganda, ya'ni
// burst animatsiya ROSTDAN ko'rsatilish kerak bo'lgandagina yuklanadi.
const Lottie = React.lazy(() => import('lottie-react'));

/**
 * `style` prop — stagger animatsiyasi uchun `--stagger-index` CSS
 * o'zgaruvchisini uzatish imkonini beradi (ProductGrid tomonidan
 * ishlatiladi).
 */
const ProductCard = ({ product, style }) => {
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [busy, setBusy] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [justFavorited, setJustFavorited] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const hasDiscount = product.discount_percent > 0;
  const image = product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : null;
  const isNew = isNewProduct(product.created_at);
  const outOfStock = product.stock <= 0;
  const detailLink = `/mahsulot/${product.id}`;
  const navigate = useNavigate();
  // Rang/o'lcham/variant tanlovi bor mahsulotni "tez qo'shish" orqali
  // to'g'ridan-to'g'ri savatga tashlab bo'lmaydi — noto'g'ri rang/o'lchamda
  // ketib qolishi mumkin. Bunday mahsulotlarda tugma mahsulot sahifasiga
  // olib boradi, xuddi tugagan mahsulotlar uchun "Batafsil" kabi.
  const requiresChoice = (product.variants?.length > 0) || (product.colors?.length > 0) || (product.sizes?.length > 0);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    hapticImpact('light');
    const wasInWishlist = inWishlist;
    try {
      await toggleWishlist(product);
      if (!wasInWishlist) {
        setJustFavorited(true);
        setTimeout(() => setJustFavorited(false), 900);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || busy) return;
    if (requiresChoice) {
      navigate(detailLink);
      return;
    }
    setBusy(true);
    try {
      await addToCart(product, null, 1);
      hapticNotification('success');
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="product-card" style={style}>
      <div className="product-image-wrapper">
        <Link to={detailLink}>
          {image && !imgError ? (
            <img
              src={image}
              alt={product.name}
              className="product-image"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="product-image product-image--placeholder">
              <ProductImagePlaceholder colorName={product.colors?.[0]} />
            </div>
          )}
        </Link>

        <div className="product-badges">
          {isNew && <span className="badge-new">YANGI</span>}
          {hasDiscount && <span className="badge-sale">-{product.discount_percent}%</span>}
          {outOfStock && <span className="badge-out">Tugagan</span>}
        </div>

        <button
          className={`wishlist-btn ${inWishlist ? 'is-active' : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
          aria-pressed={inWishlist}
        >
          {inWishlist ? <Heart size={18} fill="currentColor" /> : <Heart size={18} />}
        </button>
        {justFavorited && (
          <div className="lottie-burst lottie-burst--wishlist" aria-hidden="true">
            <React.Suspense fallback={null}>
              <Lottie animationData={heartPopAnim} loop={false} autoplay style={{ width: 56, height: 56 }} />
            </React.Suspense>
          </div>
        )}

        <div className="quick-view-overlay">
          {!outOfStock ? (
            <div className="quick-add-wrap">
              <button className={`quick-view-btn ${justAdded ? 'is-added' : ''}`} onClick={handleQuickAdd} disabled={busy}>
                {justAdded ? <>Qo'shildi <Check size={16} /></> : requiresChoice ? "Rang/o'lcham tanlash" : "Savatga qo'shish"}
              </button>
              {justAdded && (
                <div className="lottie-burst" aria-hidden="true">
                  <React.Suspense fallback={null}>
                    <Lottie animationData={cartSuccessAnim} loop={false} autoplay style={{ width: 70, height: 70 }} />
                  </React.Suspense>
                </div>
              )}
            </div>
          ) : (
            <Link to={detailLink} className="quick-view-btn">Batafsil</Link>
          )}
        </div>
      </div>

      <div className="product-info">
        {product.category && <span className="product-category">{product.category.name || product.category}</span>}
        <Link to={detailLink} className="product-title-link">
          <h3 className="product-title">{product.name}</h3>
        </Link>

        <div className="product-price-container">
          {hasDiscount ? (
            <>
              <span className="price-old">{formatPrice(product.selling_price)}</span>
              <span className="price-new">{formatPrice(product.final_price)}</span>
            </>
          ) : (
            <span className="price-current">{formatPrice(product.selling_price)}</span>
          )}
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="color-dots">
            {product.colors.slice(0, 5).map((color, idx) => (
              <span key={idx} className="color-dot" title={color} style={{ backgroundColor: colorNameToHex(color) }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
