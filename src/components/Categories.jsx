import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../assets/assets';

const Categories = () => {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Manually define category groups based on path
  const toysItems = categories.filter(item => item.path === 'Toys');
  const kitchenItems = categories.filter(item => item.path === 'Kitchen');

  const categoryGroups = [
    { title: 'Toys', items: toysItems, key: 'toys' },
    { title: 'Kitchen Items', items: kitchenItems, key: 'kitchen' }
  ];

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const showAllCategories = () => {
    setSelectedCategory(null);
    setExpandedCategories({});
  };

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-4">
        <p className="text-2xl md:text-3xl font-medium">Categories</p>
        {selectedCategory && (
          <button
            onClick={showAllCategories}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
          >
            ← Back to All Categories
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-8 mt-4">
        {(selectedCategory ? categoryGroups.filter(group => group.key === selectedCategory) : categoryGroups).map((group, groupIndex) => (
          group.items.length > 0 && (
            <div key={groupIndex} className="flex flex-col">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">{group.title}</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {/* Show only first item when collapsed */}
                {!expandedCategories[group.key] && (
                  <div
                    key={0}
                    className="group cursor-pointer py-4 px-2 gap-2 rounded-lg flex flex-col justify-center items-center transition w-40"
                    style={{ backgroundColor: group.items[0].bgColor }}
                    onClick={() => toggleCategory(group.key)}
                  >
                    <img
                      src={group.items[0].image}
                      alt={group.items[0].text}
                      className="group-hover:scale-110 transition-transform max-w-20"
                    />
                    <p className="text-xs font-medium mt-2 text-center">{group.items[0].text}</p>
                    {group.items.length > 1 && (
                      <p className="text-xs text-gray-600 mt-1">+{group.items.length - 1} more</p>
                    )}
                  </div>
                )}

                {/* Show all items as product cards when expanded */}
                {expandedCategories[group.key] && group.items.map((category, index) => {
                  const rating = (index % 3) + 3; // Rating between 3-5
                  const reviews = (index % 7) + 2; // Reviews between 2-8
                  
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col w-64 cursor-pointer"
                      onClick={() => {
                        navigate('/product/' + category.text.toLowerCase().replace(/\s+/g, '-'));
                        window.scrollTo(0, 0);
                      }}
                    >
                      {/* Product Image */}
                      <div className="relative overflow-hidden rounded-lg mb-3" style={{ backgroundColor: category.bgColor }}>
                        <img
                          src={category.image}
                          alt={category.text}
                          className="w-full h-40 object-contain hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Info */}
                      <h4 className="text-base font-semibold text-gray-800 mb-1">{category.text}</h4>
                      <p className="text-xs text-gray-500 mb-2">{category.type}</p>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-green-600">Rs. {category.price}</span>
                        {category.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">Rs. {category.oldPrice}</span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">({reviews})</span>
                      </div>

                      {/* Add to Cart Button */}
                      <button 
                        className="w-full text-white font-medium py-2.5 rounded-lg transition-colors duration-300" 
                        style={{ backgroundColor: '#00FF33' }} 
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#00CC29'} 
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#00FF33'}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart logic here
                          alert('Added to cart!');
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  );
                })}
                
                {/* Show Less Button */}
                {expandedCategories[group.key] && group.items.length > 1 && (
                  <div
                    className="group cursor-pointer py-4 px-2 gap-2 rounded-lg flex flex-col justify-center items-center transition bg-gray-100 hover:bg-gray-200 w-64 h-auto"
                    onClick={() => toggleCategory(group.key)}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium mt-2 text-gray-600">Show Less</p>
                  </div>
                )}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Categories;