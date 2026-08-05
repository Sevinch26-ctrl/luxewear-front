import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Frown, Star, Heart, Check } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { colorNameToHex } from '../../utils/colorMap';
import { getImageUrl } from '../../utils/constants';
import Lottie from 'lottie-react';
import cartSuccessAnim from '../../assets/lottie/cart-success.json';
import heartPopAnim from '../../assets/lottie/heart-pop.json';
import API from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { AuthContext } from '../../context/AuthContext';
import { hapticNotification } from '../../lib/telegram';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductImagePlaceholder from '../../components/ProductImagePlaceholder/ProductImagePlaceholder';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
  const { isAuthenticated } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImage, setActiveImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addBusy, setAddBusy] = useState(false);
  const [addedMsg, setAddedMsg] = useState(false);
  const [justFavorited, setJustFavorited] = useState(false);
  const [selectionError, setSelectionError] = useState('');

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const { data } = await API.get(`/products/${id}`);
        if (cancelled) return;
        setProduct(data);
        setActiveImage(data.images && data.images[0]);
        // Faqat BITTA variant bo'lsa avtomatik belgilanadi, chunki bunda
        // haqiqiy "tanlov" yo'q. 2+ variant/rang bo'lsa, mijoz ANIQ o'zi
        // tanlashi kerak — aks holda noto'g'ri rang/o'lchamda buyurtma
        // ketib qolishi mumkin (qarang: handleAddToCart'dagi tekshiruv).
        if (data.variants && data.variants.length === 1) {
          setSelectedVariant(data.variants[0]);
          if (data.variants[0].image) setActiveImage(data.variants[0].image);
        } else if ((!data.variants || data.variants.length === 0) && data.colors && data.colors.length === 1) {
          setSelectedColor(data.colors[0]);
        }
        if ((!data.variants || data.variants.length === 0) && data.sizes && data.sizes.length === 1) {
          setSelectedSize(data.sizes[0]);
        }
        const [simRes, revRes] = await Promise.all([
          API.get(`/recommendations/similar/${id}`).catch(() => ({ data: [] })),
          API.get(`/reviews/${id}`).catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        setSimilar(Array.isArray(simRes.data) ? simRes.data : []);
        setReviews(Array.isArray(revRes.data) ? revRes.data : []);
      } catch (err) {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    window.scrollTo(0, 0);
    return () => { cancelled = true; };
  }, [id]);

  const hasVariants = product?.variants && product.variants.length > 0;
  const stock = hasVariants ? (selectedVariant?.stock ?? 0) : (product?.stock ?? 0);
  const outOfStock = stock <= 0;

  /**
   * Variant tanlanganda — variantning O'ZIGA TEGISHLI rasmi bo'lsa
   * (backendda ProductVariant.image), asosiy rasm o'sha rasmga o'tadi.
   */
  const handleVariantSelect = (v) => {
    setSelectedVariant(v);
    setSelectionError('');
    if (v.image) setActiveImage(v.image);
  };

  /**
   * Rang bosilganda mos rasmga o'tish: mahsulot rasmlari `images[i]` va
   * ranglar `colors[i]` BIR XIL TARTIBDA saqlanadi (admin panelda rasm
   * yuklashda shu tartibda qo'shiladi) — shuning uchun indeks bo'yicha
   * to'g'ridan-to'g'ri moslashtiramiz. Agar shu indeksga mos rasm mavjud
   * bo'lmasa (masalan ranglar soni rasmlar sonidan ko'p bo'lsa), joriy
   * rasm o'zgarishsiz qoladi — xato chiqarish o'rniga muloyim tushish.
   */
  const handleColorSelect = (color, idx) => {
    setSelectedColor(color);
    setSelectionError('');
    if (product?.images && product.images[idx]) {
      setActiveImage(product.images[idx]);
    }
  };

  const handleAddToCart = async () => {
    if (outOfStock || addBusy) return;

    // Variant (rang+o'lcham birga) bor mahsulotlarda variant tanlanishi shart.
    if (hasVariants && !selectedVariant) {
      setSelectionError("Iltimos, avval variantni tanlang");
      return;
    }
    // Variant'i yo'q, lekin rang variantlari bor bo'lsa — rang tanlanishi shart.
    if (!hasVariants && product.colors?.length > 0 && !selectedColor) {
      setSelectionError("Iltimos, avval rangni tanlang");
      return;
    }
    // Xuddi shunday — o'lcham variantlari bor bo'lsa, o'lcham tanlanishi shart.
    if (!hasVariants && product.sizes?.length > 0 && !selectedSize) {
      setSelectionError("Iltimos, avval o'lchamni tanlang");
      return;
    }

    setSelectionError('');
    setAddBusy(true);
    try {
      await addToCart(
        product,
        hasVariants ? selectedVariant?.id : null,
        quantity,
        hasVariants ? null : selectedColor,
        hasVariants ? null : selectedSize,
      );
      hapticNotification('success');
      setAddedMsg(true);
      setTimeout(() => setAddedMsg(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddBusy(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewBusy(true);
    try {
      const { data } = await API.post('/reviews/', { product_id: Number(id), ...reviewForm });
      setReviews((prev) => [data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Sharh qoldirishda xatolik yuz berdi');
    } finally {
      setReviewBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="container section">
        <div className="product-detail-grid">
          <div className="skeleton" style={{ aspectRatio: '3/4' }} />
          <div>
            <div className="skeleton" style={{ height: 32, width: '70%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 100, width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container section empty-state text-center">
        <div className="empty-state__icon"><Frown size={48} strokeWidth={1.25} /></div>
        <h2>Mahsulot topilmadi</h2>
        <p>Ehtimol u o'chirilgan yoki mavjud emas</p>
        <Link to="/mahsulotlar" className="btn btn-primary" style={{ marginTop: 20 }}>Katalogga qaytish</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [null];
  const displayPrice = hasVariants && selectedVariant?.selling_price ? selectedVariant.selling_price : product.final_price;
  const hasDiscount = !hasVariants && product.discount_percent > 0;

  return (
    <div className="product-detail-page container section">
      <div className="product-detail-grid">
        <div className="product-gallery">
          <div className="main-image-container">
            {activeImage ? (
              <img
                key={activeImage}
                src={getImageUrl(activeImage)}
                alt={product.name}
                className="main-image image-swap-fade"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div className="main-image main-image--placeholder" style={activeImage ? { display: 'none' } : undefined}>
              <ProductImagePlaceholder colorName={selectedColor || product.colors?.[0]} />
            </div>
          </div>
          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((img, idx) => (
                <img
                  key={idx} src={getImageUrl(img)} alt="" loading="lazy"
                  className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info-detail">
          {product.category && <span className="product-category">{product.category.name}</span>}
          <h1 className="detail-title">{product.name}</h1>

          {product.review_count > 0 && (
            <div className="detail-rating">
              <Star size={15} fill="currentColor" /> {product.average_rating} ({product.review_count} sharh)
            </div>
          )}

          <div className="detail-price">
            {hasDiscount && <span className="old-price">{formatPrice(product.selling_price)}</span>}
            <span className="current-price">{formatPrice(displayPrice)}</span>
            {hasDiscount && <span className="discount-badge">-{product.discount_percent}%</span>}
          </div>

          {product.description && <p className="detail-description">{product.description}</p>}

          {hasVariants ? (
            <div className="selection-group">
              <h4>Variant tanlang {!selectedVariant && <span className="required-dot" />}</h4>
              <div className="size-options">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    className={`size-btn ${selectedVariant?.id === v.id ? 'active' : ''}`}
                    onClick={() => handleVariantSelect(v)}
                    disabled={v.stock <= 0}
                  >
                    {[v.color, v.size].filter(Boolean).join(' / ')}{v.stock <= 0 ? ' (tugagan)' : ''}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {product.colors && product.colors.length > 0 && (
                <div className="selection-group">
                  <h4>Rang {!selectedColor && <span className="required-dot" />}</h4>
                  <div className="color-options">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: colorNameToHex(color) }}
                        title={color}
                        onClick={() => handleColorSelect(color, idx)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {product.sizes && product.sizes.length > 0 && (
                <div className="selection-group">
                  <h4>O'lcham {!selectedSize && <span className="required-dot" />}</h4>
                  <div className="size-options">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => { setSelectedSize(size); setSelectionError(''); }}
                      >{size}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {selectionError && <div className="selection-error">{selectionError}</div>}

          <div className="selection-group quantity-group">
            <h4>Miqdor</h4>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(stock || 99, quantity + 1))}>+</button>
            </div>
            {!outOfStock && stock <= 5 && <span className="low-stock-hint">Omborda {stock} dona qoldi</span>}
          </div>

          <div className="action-buttons">
            <div className="btn-add-cart-wrap">
              <button className={`btn-add-cart ${addedMsg ? 'is-added' : ''}`} onClick={handleAddToCart} disabled={outOfStock || addBusy}>
                {outOfStock ? 'Tugagan' : addedMsg ? <>Savatga qo'shildi <Check size={16} /></> : "Savatga qo'shish"}
              </button>
              {addedMsg && (
                <div className="lottie-burst" aria-hidden="true">
                  <Lottie animationData={cartSuccessAnim} loop={false} autoplay style={{ width: 90, height: 90 }} />
                </div>
              )}
            </div>
            <div className="btn-wishlist-wrap">
              <button
                className={`btn-wishlist ${inWishlist ? 'is-active' : ''}`}
                onClick={() => {
                  const wasInWishlist = inWishlist;
                  toggleWishlist(product);
                  if (!wasInWishlist) {
                    setJustFavorited(true);
                    setTimeout(() => setJustFavorited(false), 900);
                  }
                }}
                aria-label="Sevimlilarga qo'shish"
              >
                {inWishlist ? <Heart size={20} fill="currentColor" /> : <Heart size={20} />}
              </button>
              {justFavorited && (
                <div className="lottie-burst" aria-hidden="true">
                  <Lottie animationData={heartPopAnim} loop={false} autoplay style={{ width: 70, height: 70 }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="reviews-section">
        <h2>Sharhlar {reviews.length > 0 && `(${reviews.length})`}</h2>

        {isAuthenticated ? (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <div className="review-form__rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button" key={star}
                  className={`star-btn ${reviewForm.rating >= star ? 'active' : ''}`}
                  onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                ><Star size={22} fill={reviewForm.rating >= star ? 'currentColor' : 'none'} /></button>
              ))}
            </div>
            <textarea
              className="form-input" rows={3} placeholder="Fikringizni yozing..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              required
            />
            {reviewError && <p className="checkout-error">{reviewError}</p>}
            <button className="btn btn-primary" disabled={reviewBusy}>{reviewBusy ? 'Yuborilmoqda...' : 'Sharh qoldirish'}</button>
          </form>
        ) : (
          <p className="empty-hint">Sharh qoldirish uchun <Link to="/kirish">tizimga kiring</Link>.</p>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="empty-hint">Hozircha sharhlar yo'q — birinchi bo'ling!</p>
          ) : (
            reviews.map((r) => (
              <div className="review-item" key={r.id}>
                <div className="review-item__stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} fill={star <= r.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {similar.length > 0 && (
        <section className="section">
          <h2 className="section-title">O'xshash mahsulotlar</h2>
          <div className="products-grid" style={{ marginTop: 'var(--space-8)' }}>
            {similar.map((p, idx) => (
              <ProductCard key={p.id} product={p} style={{ '--stagger-index': idx }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
