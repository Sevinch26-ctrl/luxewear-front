import React, { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lightbulb } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { TelegramContext } from '../../context/TelegramContext';
import { BOT_URL } from '../../utils/constants';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading } = useContext(AuthContext);
  const { isTelegram } = useContext(TelegramContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const explicitNext = searchParams.get('next');
  const next = explicitNext || '/profil';

  const redirectAfterAuth = () => {
    navigate(next, { replace: true });
  };

  React.useEffect(() => {
    if (isAuthenticated) redirectAfterAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      redirectAfterAuth();
    } else {
      setError(result.error);
    }
  };

  // Telegram Mini App ichida — AuthContext initData orqali avtomatik
  // autentifikatsiya qilishga harakat qiladi, shu bois email formasi kerak emas.
  if (isTelegram) {
    return (
      <div className="auth-page">
        <div className="auth-container auth-container--telegram">
          <div className="telegram-auth-status">
            <div className="telegram-auth-spinner" aria-hidden="true" />
            <h2>Telegram orqali kirilmoqda...</h2>
            <p>Iltimos biroz kuting.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return null;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image">
          <h2>Xush Kelibsiz123</h2>
          <p>LuxeWear olamiga qadam qo'ying</p>
        </div>
        <div className="auth-form-container">
          <h2 className="auth-title">Kirish</h2>
          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="form-group password-group">
              <label className="form-label">Parol</label>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn btn-primary full-width auth-btn">Kirish</button>

            <p className="auth-redirect">
              Hisobingiz yo'qmi? <Link to={`/royxatdan-otish${next !== '/profil' ? `?next=${encodeURIComponent(next)}` : ''}`}>Ro'yxatdan o'tish</Link>
            </p>
            <p className="auth-hint">
              <Lightbulb size={15} className="auth-hint-icon" /> Telegram orqali xarid qilish uchun botimizni <a href={BOT_URL} target="_blank" rel="noreferrer">shu yerda</a> oching — ro'yxatdan o'tish shart emas.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
