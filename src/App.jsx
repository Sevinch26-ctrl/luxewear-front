import React, { useState, lazy, Suspense } from 'react';
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

// Sahifalar — route asosida bo'lib yuklanadi (lazy). Bosh sahifa faqat
// o'ziga kerakli kodni oladi; lottie, auth, checkout va h.k. faqat o'sha
// sahifa ochilganda yuklanadi. Bu boshlang'ich JS hajmini keskin kamaytiradi.
const Home = lazy(() => import('./pages/Home/Home'));
const Categories = lazy(() => import('./pages/Categories/Categories'));
const Products = lazy(() => import('./pages/Products/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist/Wishlist'));
const Search = lazy(() => import('./pages/Search/Search'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const NotFound = lazy(() => import('./pages/Errors/NotFound'));

function PageFallback() {
  return (
    <div className="flex-center" style={{ minHeight: '40vh' }}>
      <div className="spinner" role="status" aria-label="Yuklanmoqda" />
    </div>
  );
}

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
            <Suspense fallback={<PageFallback />}>
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
            </Suspense>
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
