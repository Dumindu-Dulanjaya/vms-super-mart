import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';

import { Toaster } from 'react-hot-toast';

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.includes("seller");

  return (
    <div className="min-h-screen flex flex-col">
      {/* If seller path → hide Navbar, else show Navbar */}
      {isSellerPath ? null : <Navbar />}

      <Toaster position="top-right" />

      <div className={`${isSellerPath ? "p-6" : "px-6 md:px-16 lg:px-24 xl:px-32"} flex-1`}>
        <Routes>
          {/* Normal user routes */}
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/all-products' element={<AllProducts />} />
          <Route path='/product/:slug' element={<ProductDetails />} />
          <Route path='/products/category/:category' element={<ProductCategory />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/wishlist' element={<Wishlist />} />
          <Route path='/checkout' element={<Checkout />} />

          {/* Later you can add seller routes here if needed */}
        </Routes>
      </div>
      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;