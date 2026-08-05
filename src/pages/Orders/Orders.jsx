import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ArrowLeft, PackageX } from 'lucide-react';
import API from '../../services/api';
import { formatPrice, formatDate } from '../../utils/format';
import { getImageUrl } from '../../utils/constants';
import ProductImagePlaceholder from '../../components/ProductImagePlaceholder/ProductImagePlaceholder';
import './Orders.css';

const STATUS_LABELS = {
  pending: { label: 'Kutilmoqda', className: 'status-pending' },
  confirmed: { label: 'Tasdiqlandi', className: 'status-confirmed' },
  processing: { label: 'Tayyorlanmoqda', className: 'status-processing' },
  shipped: { label: "Jo'natildi", className: 'status-shipped' },
  delivered: { label: 'Yetkazildi', className: 'status-delivered' },
  cancelled: { label: 'Bekor qilindi', className: 'status-cancelled' },
};

function StatusBadge({ status }) {
  const info = STATUS_LABELS[status] || { label: status, className: '' };
  return <span className={`order-status ${info.className}`}>{info.label}</span>;
}

function OrderCard({ order, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="order-card">
      <button className="order-card__header" onClick={() => setOpen((v) => !v)}>
        <div>
          <span className="order-number">#{order.order_number}</span>
          <span className="order-date">{formatDate(order.created_at)}</span>
        </div>
        <div className="order-card__right">
          <StatusBadge status={order.status} />
          <span className="order-total">{formatPrice(order.total_amount)}</span>
          <span className={`order-chevron ${open ? 'is-open' : ''}`}><ChevronDown size={18} /></span>
        </div>
      </button>

      {open && (
        <div className="order-card__body">
          <div className="order-items">
            {order.items.map((item) => (
              <div className="order-item-row" key={item.id}>
                {item.product_image ? (
                  <img src={getImageUrl(item.product_image)} alt="" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                ) : null}
                <div className="order-item-row__placeholder" style={item.product_image ? { display: 'none' } : undefined}><ProductImagePlaceholder /></div>
                <div className="order-item-row__info">
                  <span>{item.product_name}</span>
                  {item.variant_info && <small>{item.variant_info}</small>}
                </div>
                <span>{item.quantity} × {formatPrice(item.unit_price)}</span>
              </div>
            ))}
          </div>
          <div className="order-delivery">
            <p><strong>Yetkazib berish:</strong> {order.address}{order.city ? `, ${order.city}` : ''}</p>
            <p><strong>Telefon:</strong> {order.phone}</p>
            <p><strong>To'lov:</strong> {order.payment_method === 'cash_on_delivery' ? 'Yetkazganda naqd' : 'Onlayn karta'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const Orders = () => {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [singleOrder, setSingleOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        if (id) {
          const { data } = await API.get(`/orders/${id}`);
          if (!cancelled) setSingleOrder(data);
        } else {
          const { data } = await API.get('/orders/');
          if (!cancelled) setOrders(data);
        }
      } catch (err) {
        if (!cancelled) setError("Buyurtmalarni yuklab bo'lmadi");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="container section">
        <div className="skeleton" style={{ height: 80, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 80, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 80 }} />
      </div>
    );
  }

  if (error) {
    return <div className="container section empty-state text-center"><p>{error}</p></div>;
  }

  // Bitta buyurtma ko'rinishi (masalan, bot bildirishnomasidagi "Buyurtmani ko'rish" tugmasidan)
  if (id) {
    if (!singleOrder) {
      return (
        <div className="container section empty-state text-center">
          <h2>Buyurtma topilmadi</h2>
          <Link to="/buyurtmalar" className="btn btn-primary" style={{ marginTop: 20 }}>Barcha buyurtmalar</Link>
        </div>
      );
    }
    return (
      <div className="container section orders-page">
        <Link to="/buyurtmalar" className="back-link"><ArrowLeft size={15} /> Barcha buyurtmalar</Link>
        <h1 className="page-title">Buyurtma #{singleOrder.order_number}</h1>
        <OrderCard order={singleOrder} defaultOpen />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container section empty-state text-center">
        <div className="empty-state__icon"><PackageX size={48} strokeWidth={1.25} /></div>
        <h2>Buyurtmalar tarixi bo'sh</h2>
        <p>Siz hali birorta ham buyurtma bermagansiz</p>
        <Link to="/mahsulotlar" className="btn btn-primary" style={{ marginTop: 20 }}>Xarid qilishni boshlash</Link>
      </div>
    );
  }

  return (
    <div className="container section orders-page">
      <h1 className="page-title">Buyurtmalarim</h1>
      <div className="orders-list">
        {orders.map((order) => <OrderCard key={order.id} order={order} />)}
      </div>
    </div>
  );
};

export default Orders;
