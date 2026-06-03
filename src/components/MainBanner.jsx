import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import banner1 from '../assets/banner.jpg';
import banner2 from '../assets/baner 2.png';
import vmsHero from '../assets/vms hero.png';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

const MainBanner = () => {
  const banners = [banner1, banner2];
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000); // Change banner every 3 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div 
      className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-slate-950 group cursor-pointer"
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Default Modern Hero State (vmsHero) */}
      <div 
        data-testid="default-hero"
        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
          isHovered ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
        }`}
      >
        {/* Background Image */}
        <img
          src={vmsHero}
          alt="VMS Super Mart Hero"
          className="w-full h-full object-cover object-top transition-transform duration-[2000ms] group-hover:scale-105"
        />
        
        {/* Modern Dark/Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent flex items-center">
          {/* Glassmorphic/Glowing Hero Content */}
          <div className="max-w-2xl ml-6 md:ml-16 p-6 md:p-10 rounded-none bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Top decorative neon glow line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF33] to-transparent"></div>
            
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FF33]/10 border border-[#00FF33]/25 mb-4 md:mb-6">
              <Sparkles className="w-4 h-4 text-[#00FF33]" />
              <span className="text-xs md:text-sm font-semibold tracking-wider text-[#00FF33] uppercase">
                Welcome to VMS Super Mart
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-md">
              Freshness & Quality <br />
              <span className="bg-gradient-to-r from-white via-[#00FF33] to-[#00CC29] bg-clip-text text-transparent font-extrabold">
                Delivered Daily
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 md:mb-8 font-medium">
              Discover unbeatable deals on fresh vegetables, grocery essentials, dairy, and household goods. Experience smart shopping designed just for you.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <Link 
                to="/all-products" 
                className="px-6 py-3 bg-[#00FF33] hover:bg-[#00CC29] text-slate-900 font-extrabold rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(0,255,51,0.4)] hover:shadow-[0_0_25px_rgba(0,255,51,0.6)] flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <ShoppingBag size={18} />
                Shop Now
              </Link>

              <Link 
                to="/all-products"
                onMouseEnter={() => setIsHovered(true)}
                className="flex items-center gap-2 text-white font-bold hover:gap-3 transition-all duration-300 group/btn"
              >
                <span>Explore Deals</span> 
                <ArrowRight size={18} className="text-[#00FF33] group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hovered Carousel State (banner1 & banner2) */}
      <div 
        data-testid="carousel-hero"
        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
          isHovered ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Banner Images */}
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner}
            alt={`Promo Banner ${index + 1}`}
            className={`w-full h-full object-cover transition-all duration-1000 ease-in-out ${
              index === currentBannerIndex ? 'opacity-100 scale-100' : 'opacity-0 absolute top-0 left-0 scale-105'
            }`}
          />
        ))}

        {/* Carousel Overlays / Controls */}
        <div className="absolute inset-0 bg-slate-950/20"></div>

        {/* Buttons on the Banner */}
        <div className="absolute bottom-6 left-6 md:left-16 flex items-center gap-4">
          {/* Shop Now Button */}
          <Link 
            to="/all-products" 
            className="px-6 py-3 bg-[#00FF33] hover:bg-[#00CC29] text-slate-900 font-extrabold rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(0,255,51,0.3)] flex items-center gap-2"
          >
            <ShoppingBag size={18} />
            Shop Now
          </Link>

          {/* Explore Deals (text + arrow) */}
          <Link 
            to="/all-products" 
            className="flex items-center gap-2 text-white font-black hover:gap-3 transition-all duration-300 drop-shadow-md"
          >
            Explore deals 
            <ArrowRight size={18} className="text-[#00FF33]" />
          </Link>
        </div>

        {/* Banner Navigation Dots */}
        <div className="absolute bottom-6 right-6 md:right-16 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentBannerIndex(index);
              }}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentBannerIndex 
                  ? 'bg-[#00FF33] w-8' 
                  : 'bg-white/50 hover:bg-white/75 w-3'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
