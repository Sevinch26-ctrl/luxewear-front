import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import Logo from '../Logo/Logo';
import { TELEGRAM_BOT_URL } from '../../utils/constants';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-col">
          <div className="footer-brand">
            <Logo size={26} />
            <span>LuxeWear</span>
          </div>
          <p className="footer-slogan">Nafislik har bir tafsilotda.</p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href={TELEGRAM_BOT_URL} target="_blank" rel="noreferrer">Telegram</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </div>

        <div className="footer-col">
          <h3>Katalog</h3>
          <ul>
            <li><Link to="/mahsulotlar">Barcha mahsulotlar</Link></li>
            <li><Link to="/kategoriyalar">Kategoriyalar</Link></li>
            <li><Link to="/mahsulotlar?sort=new">Yangi kelganlar</Link></li>
            <li><Link to="/mahsulotlar?sale=true">Aksiyalar</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Mijozlar uchun</h3>
          <ul>
            <li><Link to="/profil">Buyurtmalarim</Link></li>
            <li><Link to="/sevimlilar">Sevimlilar</Link></li>
            <li><Link to="/qidirish">Qidirish</Link></li>
            <li><Link to="/kirish">Kirish / Ro'yxatdan o'tish</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Telegram botimiz</h3>
          <p>Do'konni Telegram ichida oching — buyurtma holati va aksiyalardan darhol xabar toping.</p>
          <a href={TELEGRAM_BOT_URL} target="_blank" rel="noreferrer" className="btn btn-primary footer-bot-link">
            <Bot size={17} /> Botni ochish
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LuxeWear. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  );
};

export default Footer;
