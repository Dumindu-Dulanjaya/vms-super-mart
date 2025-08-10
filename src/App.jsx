import React from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home'; // Make sure path matches where your Home.jsx is
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
