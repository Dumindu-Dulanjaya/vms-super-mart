import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';

// Pages
import Home from './pages/Home';
import Contact from './pages/Contact';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import VmsPortal from './pages/VmsPortal';
import AdminLayout from './pages/admin/AdminLayout';
import DeliveryDashboard from './pages/DeliveryDashboard';
import { useAppContext } from './context/AppContext';

import { Toaster } from 'react-hot-toast';

const App = () => {
  const { isAdminAuthenticated } = useAppContext();
  const location = useLocation();

  // Mobile viewport detection
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAdminPath = location.pathname.startsWith("/admin");
  const isSellerPath = location.pathname.includes("seller");
  const isDeliveryPath = location.pathname.startsWith("/delivery");
  const isPortalPath = location.pathname.startsWith("/portal") || (location.pathname === "/" && isMobile);

  const isFullLayoutPath = !isAdminPath && !isSellerPath && !isDeliveryPath && !isPortalPath;
  const isHomePage = location.pathname === "/" && !isMobile;


  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* If admin or seller path → hide Navbar, else show Navbar */}
      {isFullLayoutPath && <Navbar />}

      <Toaster position="top-right" />

      {/* Dynamic Floating AI Chatbot Assistant for Shoppers */}
      {isFullLayoutPath && <ChatbotWidget />}

      <div className={`${isFullLayoutPath ? (isHomePage ? "p-0" : "px-6 md:px-16 lg:px-24 xl:px-32 py-10") : "p-0"} flex-1`}>
        <Routes>
          {/* Normal user routes */}
          <Route path='/' element={isMobile ? <VmsPortal /> : <Home />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/all-products' element={<AllProducts />} />
          <Route path='/product/:slug' element={<ProductDetails />} />
          <Route path='/products/category/:category' element={<ProductCategory />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/wishlist' element={<Wishlist />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/my-orders' element={<MyOrders />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/portal' element={<VmsPortal />} />

          {/* Delivery Dashboard */}
          <Route path='/delivery' element={<DeliveryDashboard />} />

          {/* Admin Routes */}
          <Route path='/admin/*' element={isAdminAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
      {isFullLayoutPath && <Footer />}
    </div>
  );
};

export default App;