import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { TelegramProvider } from './context/TelegramContext';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Intro from './components/Intro/Intro';

// Pages
import Home from './pages/Home/Home';
import Categories from './pages/Categories/Categories';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import Search from './pages/Search/Search';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import Checkout from './pages/Checkout/Checkout';
import NotFound from './pages/Errors/NotFound';

/**
 * Sahifa almashganda tarkibni nozik fade+lift bilan almashtiradi
 * (animations.css dagi .page-enter/.page-enter-active).
 */
function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState('enter-active');

  React.useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setStage('enter');
      setDisplayLocation(location);
      const raf = requestAnimationFrame(() => setStage('enter-active'));
      return () => cancelAnimationFrame(raf);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <div className={stage === 'enter' ? 'page-enter' : 'page-enter-active'}>
      {children}
    </div>
  );
}

function CustomerSite() {
  // Intro tugagach true bo'ladi — Header/Home shu bayroqni kutib turadi,
  // shunda ularning kirish animatsiyalari Intro ortida "yashirincha"
  // o'ynalib ketmaydi, foydalanuvchi ularni haqiqatan ko'radi.
  const [ready, setReady] = useState(false);

  return (
    <CartProvider>
      <WishlistProvider>
        <Intro onFinish={() => setReady(true)} />
        <Header ready={ready} />
        <main className="main-content">
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home ready={ready} />} />
              <Route path="/kategoriyalar" element={<Categories />} />
              <Route path="/mahsulotlar" element={<Products />} />
              <Route path="/mahsulot/:id" element={<ProductDetail />} />
              <Route path="/savat" element={<Cart />} />
              <Route path="/sevimlilar" element={<Wishlist />} />
              <Route path="/qidirish" element={<Search />} />
              <Route path="/kirish" element={<Login />} />
              <Route path="/royxatdan-otish" element={<Register />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/buyurtmalar" element={<Orders />} />
              <Route path="/buyurtmalar/:id" element={<Orders />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </main>
        <Footer />
      </WishlistProvider>
    </CartProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TelegramProvider>
        <AuthProvider>
          <Router>
            <CustomerSite />
          </Router>
        </AuthProvider>
      </TelegramProvider>
    </ThemeProvider>
  );
}

export default App;
