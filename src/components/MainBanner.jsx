import React from 'react';
import { Link } from 'react-router-dom';
import bannerImg from '../assets/banner.jpg';
import { ArrowRight } from 'lucide-react';

const MainBanner = () => {
  return (
    <div className="relative">
      {/* Banner Image */}
      <img 
        src={bannerImg} 
        alt="Main Banner" 
        className="w-full h-auto object-cover"
      />

      {/* Buttons on the Banner */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4">
        {/* Shop Now Button */}
        <Link 
          to="/products" 
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition"
        >
          Shop now
        </Link>

        {/* Explore Deals (text + arrow) */}
        <Link 
          to="/products" 
          className="flex items-center gap-2 text-white font-bold hover:gap-3 transition"
        >
          Explore deals 
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default MainBanner;
