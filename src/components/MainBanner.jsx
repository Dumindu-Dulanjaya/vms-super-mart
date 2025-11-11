import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import banner1 from '../assets/banner.jpg';
import banner2 from '../assets/baner 2.png';
import { ArrowRight } from 'lucide-react';

const MainBanner = () => {
  const banners = [banner1, banner2];
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000); // Change banner every 3 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative">
      {/* Banner Image with fade transition */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-100">
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner}
            alt={`Banner ${index + 1}`}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentBannerIndex ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'
            }`}
          />
        ))}
      </div>

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

      {/* Banner Navigation Dots */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBannerIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentBannerIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MainBanner;
