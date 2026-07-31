import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2>Sahifa topilmadi</h2>
        <p>Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.</p>
        <Link to="/" className="btn btn-primary">Bosh sahifaga qaytish</Link>
      </div>
    </div>
  );
};

export default NotFound;
