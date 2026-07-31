import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Moon, Sun, Heart, ShoppingBag, User, Menu, LayoutDashboard } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { AuthContext } from '../../context/AuthContext';
import { ADMIN_URL } from '../../utils/constants';
import Logo from '../Logo/Logo';
import './Header.css';

const Header = ({ ready = true }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { cartCount } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isStaff = user?.role === 'admin' || user?.role === 'seller';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header glass ${scrolled ? 'scrolled' : ''} ${ready ? 'header--ready' : ''}`}>
      <div className="container header-container">
        <Link to="/" className="brand-logo">
          <Logo size={30} className="brand-logo__mark" />
          <span>LuxeWear</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Bosh sahifa</Link>
          <Link to="/kategoriyalar" onClick={() => setMenuOpen(false)}>Katalog</Link>
          <Link to="/mahsulotlar?sort=new" onClick={() => setMenuOpen(false)}>Yangi kelganlar</Link>
          <Link to="/mahsulotlar?sale=true" onClick={() => setMenuOpen(false)}>Aksiyalar</Link>
        </nav>

        <div className="header-actions">
          {isStaff && (
            <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="action-btn" aria-label="Admin panel" title="Admin panel">
              <LayoutDashboard size={19} />
            </a>
          )}

          <Link to="/qidirish" className="action-btn" aria-label="Qidirish"><Search size={19} /></Link>

          <button
            onClick={toggleTheme}
            className="action-btn theme-toggle"
            aria-label={theme === 'light' ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
          >
            <span className={`theme-toggle__icon ${theme === 'light' ? 'is-sun' : 'is-moon'}`}>
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </span>
          </button>

          <Link to="/sevimlilar" className="action-btn" aria-label="Sevimlilar">
            <Heart size={19} /> {wishlistItems.length > 0 && <span className="badge">{wishlistItems.length}</span>}
          </Link>

          <Link to="/savat" className="action-btn" aria-label="Savat">
            <ShoppingBag size={19} /> {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="profile-menu">
              <Link to="/profil" className="action-btn" aria-label="Profil"><User size={19} /></Link>
              <button onClick={logout} className="logout-btn">Chiqish</button>
            </div>
          ) : (
            <Link to="/kirish" className="login-link">Kirish</Link>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menyu">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
