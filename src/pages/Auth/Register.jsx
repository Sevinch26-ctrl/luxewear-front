import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/profil';

  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, navigate, next]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }
    if (formData.password.length < 8) {
      setError('Parol kamida 8 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setSubmitting(true);
    const result = await register(formData.name, formData.email, formData.password, formData.phone);
    setSubmitting(false);
    if (result.success) {
      navigate(next);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image register-image">
          <h2>LuxeWear a'zosi bo'ling</h2>
          <p>Yangi kolleksiyalar va maxsus chegirmalardan xabardor bo'ling</p>
        </div>
        <div className="auth-form-container">
          <h2 className="auth-title">Ro'yxatdan o'tish</h2>
          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">To'liq ismingiz</label>
              <input className="form-input" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ism Familiya" required />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Telefon raqam</label>
              <input className="form-input" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+998 90 123 45 67" />
            </div>

            <div className="form-group">
              <label className="form-label">Parol</label>
              <input className="form-input" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Kamida 8 ta belgi" required />
            </div>

            <div className="form-group">
              <label className="form-label">Parolni tasdiqlang</label>
              <input className="form-input" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Parolni qayta kiriting" required />
            </div>

            <button type="submit" className="btn btn-primary full-width auth-btn" disabled={submitting}>
              {submitting ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
            </button>

            <p className="auth-redirect">
              Allaqachon hisobingiz bormi? <Link to={`/kirish${next !== '/profil' ? `?next=${encodeURIComponent(next)}` : ''}`}>Kirish</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
