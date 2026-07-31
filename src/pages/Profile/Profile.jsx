import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, Bot, KeyRound } from 'lucide-react';
import API from '../../services/api';
import './Profile.css';

const NOTIF_PREFS = [
  { key: 'notify_order_updates', label: 'Buyurtma holati yangilanishlari' },
  { key: 'notify_promotions', label: 'Aksiya va chegirmalar' },
  { key: 'notify_price_drops', label: 'Sevimlilar narxi tushganda' },
  { key: 'notify_new_arrivals', label: 'Yangi mahsulotlar' },
];

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkInfo, setLinkInfo] = useState(null);

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  if (!user) {
    return (
      <div className="container section text-center">
        <h2>Siz tizimga kirmagansiz</h2>
        <Link to="/kirish" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>Kirish</Link>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    try {
      const { data } = await API.put('/users/profile', form);
      updateUser(data);
      setSavedMsg('saqlandi');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (err) {
      setSavedMsg(err.response?.data?.detail || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMsg('');
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError('Yangi parollar mos kelmadi');
      return;
    }
    setPwSaving(true);
    try {
      await API.put('/users/profile/password', { old_password: pwForm.old_password, new_password: pwForm.new_password });
      setPwMsg("Parol muvaffaqiyatli yangilandi");
      setPwForm({ old_password: '', new_password: '', confirm: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Parolni yangilashda xatolik yuz berdi');
    } finally {
      setPwSaving(false);
    }
  };

  const handleTogglePref = async (key) => {
    const next = { [key]: !user[key] };
    updateUser(next);
    try {
      const { data } = await API.put('/users/profile/telegram-prefs', next);
      updateUser(data);
    } catch (err) {
      updateUser({ [key]: user[key] }); // orqaga qaytarish
    }
  };

  const handleConnectTelegram = async () => {
    setLinkLoading(true);
    try {
      const { data } = await API.post('/auth/telegram-link/generate');
      setLinkInfo(data);
      window.open(data.deep_link, '_blank');
    } catch (err) {
      console.error(err);
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="profile-page container section">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-user-info">
            <div className="avatar">{user.name?.charAt(0) || 'U'}</div>
            <h3>{user.name}</h3>
            <p>{user.email || (user.telegram_username ? `@${user.telegram_username}` : '')}</p>
          </div>

          <nav className="profile-nav">
            <Link to="/profil" className="active">Mening ma'lumotlarim</Link>
            <Link to="/buyurtmalar">Buyurtmalarim</Link>
            <Link to="/sevimlilar">Sevimlilar</Link>
            <button onClick={logout} className="logout-btn-sidebar">Hisobdan chiqish</button>
          </nav>
        </aside>

        <div className="profile-content">
          <h2>Shaxsiy ma'lumotlar</h2>

          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">To'liq ism</label>
              <input className="form-input" type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>

            {user.email && (
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" defaultValue={user.email} disabled />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Telefon</label>
              <input className="form-input" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998 90 123 45 67" />
            </div>

            <div className="form-group">
              <label className="form-label">Manzil</label>
              <textarea className="form-input" rows="3" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            {savedMsg && (
              <span className="save-msg">
                {savedMsg === 'saqlandi' ? <><Check size={15} /> Saqlandi</> : savedMsg}
              </span>
            )}
          </form>

          <div className="password-section glass-panel">
            <h2><KeyRound size={18} /> Parolni o'zgartirish</h2>
            <form className="profile-form" onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Joriy parol</label>
                <input className="form-input" type="password" value={pwForm.old_password} onChange={(e) => setPwForm((f) => ({ ...f, old_password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Yangi parol</label>
                <input className="form-input" type="password" value={pwForm.new_password} onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))} minLength={8} required />
              </div>
              <div className="form-group">
                <label className="form-label">Yangi parolni tasdiqlang</label>
                <input className="form-input" type="password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} minLength={8} required />
              </div>
              {pwError && <p className="checkout-error">{pwError}</p>}
              <button type="submit" className="btn btn-outline" disabled={pwSaving}>
                {pwSaving ? 'Saqlanmoqda...' : "Parolni yangilash"}
              </button>
              {pwMsg && <span className="save-msg"><Check size={15} /> {pwMsg}</span>}
            </form>
          </div>

          <div className="telegram-section glass-panel">
            <h2>Telegram bildirishnomalari</h2>
            {user.telegram_id ? (
              <>
                <p className="telegram-connected">
                  <CheckCircle2 size={16} /> Telegram ulangan{user.telegram_username ? ` (@${user.telegram_username})` : ''}.
                  Endi buyurtma va aksiya xabarlarini Telegram botimizda ham olasiz.
                </p>
                <div className="notif-prefs">
                  {NOTIF_PREFS.map((pref) => (
                    <label key={pref.key} className="notif-pref-row">
                      <span>{pref.label}</span>
                      <button
                        type="button"
                        className={`toggle-switch ${user[pref.key] ? 'is-on' : ''}`}
                        onClick={() => handleTogglePref(pref.key)}
                        aria-pressed={!!user[pref.key]}
                      >
                        <span className="toggle-switch__knob" />
                      </button>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p>Telegram botimizga ulaning va buyurtma holatini, aksiyalarni real vaqtda oling.</p>
                <button className="btn btn-outline" onClick={handleConnectTelegram} disabled={linkLoading}>
                  {linkLoading ? 'Havola tayyorlanmoqda...' : <><Bot size={16} /> Telegram'ni ulash</>}
                </button>
                {linkInfo && (
                  <p className="telegram-link-hint">
                    Yangi oynada Telegram ochilmasa, <a href={linkInfo.deep_link} target="_blank" rel="noreferrer">shu havolani bosing</a> va botda "Start" tugmasini bosing.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
