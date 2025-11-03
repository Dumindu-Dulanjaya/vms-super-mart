import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.includes("seller");

  return (
    <div className="min-h-screen flex flex-col">
      {/* If seller path → hide Navbar, else show Navbar */}
      {isSellerPath ? null : <Navbar />}

      <Toaster />

      <div className={`${isSellerPath ? "p-6" : "px-6 md:px-16 lg:px-24 xl:px-32"} flex-1`}>
        <Routes>
          {/* Normal user routes */}
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/product/:id' element={<ProductDetails />} />
          <Route path='/products/category/:element' element={<ProductCategory />} />

          {/* Later you can add seller routes here if needed */}
        </Routes>
      </div>
      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;
