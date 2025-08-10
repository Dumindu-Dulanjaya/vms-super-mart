import React from 'react';
import bannerImg from '../assets/banner.jpg'; // Import the banner image

const MainBanner = () => {
  return (
    <div className="relative">
      {/* Banner Image */}
      <img 
        src={bannerImg} 
        alt="Main Banner" 
        className="w-full h-auto object-cover"
      />

      {/* Optional Overlay Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          {/* Uncomment and edit if you want text on the banner */}
          {/* <h1 className="text-4xl font-bold">Welcome to VMS</h1>
          <p className="text-lg mt-2">Your tagline here</p> */}
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
