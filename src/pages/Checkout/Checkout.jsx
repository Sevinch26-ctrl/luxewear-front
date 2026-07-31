import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Banknote, CreditCard } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { formatPrice } from '../../utils/format';
import { hapticNotification } from '../../lib/telegram';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, itemPrice, loading: cartLoading } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    recipient_name: user?.name || '',
    phone: user?.phone || '',
    city: '',
    address: '',
    notes: '',
    payment_method: 'cash_on_delivery',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.recipient_name || !form.phone || !form.address) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await API.post('/orders/', form);
      hapticNotification('success');
      setPlacedOrder(data);
    } catch (err) {
      hapticNotification('error');
      setError(err.response?.data?.detail || "Buyurtma berishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="container section checkout-success">
        <div className="checkout-success__icon"><CheckCircle2 size={56} strokeWidth={1.5} /></div>
        <h1>Rahmat! Buyurtmangiz qabul qilindi</h1>
        <p>
          Buyurtma raqami: <strong>#{placedOrder.order_number}</strong>. Tez orada siz bilan
          bog'lanamiz{user?.telegram_id ? ' va Telegram orqali xabar beramiz' : ''}.
        </p>
        <div className="checkout-success__actions">
          <Link to={`/buyurtmalar/${placedOrder.id}`} className="btn btn-primary">Buyurtmani ko'rish</Link>
          <Link to="/mahsulotlar" className="btn btn-outline">Xaridni davom ettirish</Link>
        </div>
      </div>
    );
  }

  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="container section empty-state text-center">
        <h2>Savat bo'sh</h2>
        <p>Buyurtma berish uchun avval savatga mahsulot qo'shing</p>
        <Link to="/mahsulotlar" className="btn btn-primary" style={{ marginTop: 20 }}>Xarid qilish</Link>
      </div>
    );
  }

  return (
    <div className="container section checkout-page">
      <h1 className="page-title">Buyurtmani rasmiylashtirish</h1>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Yetkazib berish ma'lumotlari</h3>

          <div className="form-group">
            <label className="form-label">Ism-familiya *</label>
            <input className="form-input" name="recipient_name" value={form.recipient_name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefon raqam *</label>
              <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+998 90 123 45 67" required />
            </div>
            <div className="form-group">
              <label className="form-label">Shahar</label>
              <input className="form-input" name="city" value={form.city} onChange={handleChange} placeholder="Toshkent" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Manzil *</label>
            <input className="form-input" name="address" value={form.address} onChange={handleChange} placeholder="Ko'cha, uy, xonadon" required />
          </div>

          <div className="form-group">
            <label className="form-label">Izoh (ixtiyoriy)</label>
            <textarea className="form-input" name="notes" rows={3} value={form.notes} onChange={handleChange} />
          </div>

          <h3>To'lov usuli</h3>
          <div className="payment-options">
            <label className={`payment-option ${form.payment_method === 'cash_on_delivery' ? 'is-selected' : ''}`}>
              <input
                type="radio" name="payment_method" value="cash_on_delivery"
                checked={form.payment_method === 'cash_on_delivery'} onChange={handleChange}
              />
              <span><Banknote size={17} /> Yetkazganda naqd to'lov</span>
            </label>
            <label className={`payment-option ${form.payment_method === 'card_online' ? 'is-selected' : ''}`}>
              <input
                type="radio" name="payment_method" value="card_online"
                checked={form.payment_method === 'card_online'} onChange={handleChange}
              />
              <span><CreditCard size={17} /> Onlayn karta orqali</span>
            </label>
          </div>

          {error && <p className="checkout-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-lg full-width" disabled={submitting}>
            {submitting ? 'Yuborilmoqda...' : `Buyurtmani tasdiqlash — ${formatPrice(cartTotal)}`}
          </button>
        </form>

        <aside className="checkout-summary glass-panel">
          <h3>Buyurtma ({cartItems.length})</h3>
          <div className="checkout-summary__items">
            {cartItems.map((item) => (
              <div className="checkout-summary__item" key={item.id}>
                <span className="checkout-summary__qty">{item.quantity}×</span>
                <span className="checkout-summary__name">{item.product?.name}</span>
                <span>{formatPrice(itemPrice(item) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="divider" />
          <div className="summary-row total">
            <span>Jami:</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
