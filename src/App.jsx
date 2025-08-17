import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.includes("seller");

  return (
    <div className="min-h-screen">
      {/* If seller path → hide Navbar, else show Navbar */}
      {isSellerPath ? null : <Navbar />}

      <div className={`${isSellerPath ? "p-6" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          {/* Normal user route */}
          <Route path='/' element={<Home />} />

          {/* Later you can add seller routes here if needed */}
        </Routes>
      </div>
    </div>
  );
}

export default App;
