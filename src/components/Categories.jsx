import React, { useState } from 'react';
import { categories } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-8 border-l-4 border-[#00FF33] pl-4">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Top Categories</h2>
        <button 
           onClick={() => navigate('/all-products')}
           className="text-sm font-bold text-gray-400 hover:text-[#00FF33] transition-colors uppercase tracking-widest"
        >
           View All Categories
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((item, index) => (
          <div 
            key={index}
            onClick={() => {
                navigate(`/products/category/${item.path?.toLowerCase() || item.text.toLowerCase()}`);
                window.scrollTo(0, 0);
            }}
            className="group cursor-pointer bg-white border border-gray-100 p-6 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-2xl hover:border-[#00FF33] rounded-none relative overflow-hidden"
          >
            <div 
                className="w-20 h-20 rounded-none flex items-center justify-center p-4 transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundColor: item.bgColor || '#f9fafb' }}
            >
                <img 
                    src={item.image} 
                    alt={item.text} 
                    className="w-full h-full object-contain"
                />
            </div>
            <div className="text-center">
                <p className="text-sm font-bold text-gray-800 group-hover:text-[#00FF33] transition-colors">{item.text}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter mt-1">{item.type || 'Fresh Item'}</p>
            </div>
            
            {/* Hover Indicator */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00FF33] transform translate-y-full group-hover:translate-y-0 transition-transform"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
