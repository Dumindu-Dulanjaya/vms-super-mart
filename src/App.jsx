import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

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
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import { useAppContext } from './context/AppContext';

import { Toaster } from 'react-hot-toast';

const App = () => {
  const { isAdminAuthenticated } = useAppContext();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isSellerPath = location.pathname.includes("seller");

  const isFullLayoutPath = !isAdminPath && !isSellerPath;
  const isHomePage = location.pathname === "/";

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
          <Route path='/' element={<Home />} />
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

          {/* Admin Routes */}
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin/*' element={isAdminAuthenticated ? <AdminLayout /> : <AdminLogin />} />
        </Routes>
      </div>
      {isFullLayoutPath && <Footer />}
    </div>
  );
};

export default App;