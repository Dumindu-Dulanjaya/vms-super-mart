import React, { useState } from 'react';
import { categories } from '../assets/assets';

const Categories = () => {
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

  const selectCategory = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setExpandedCategories({ [categoryKey]: true });
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
      
      <div className="flex flex-wrap gap-16 mt-4">
        {(selectedCategory ? categoryGroups.filter(group => group.key === selectedCategory) : categoryGroups).map((group, groupIndex) => (
          group.items.length > 0 && (
            <div key={groupIndex} className="flex flex-col">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">{group.title}</h3>
              <div className="flex flex-wrap gap-4">
                {(expandedCategories[group.key] ? group.items : group.items.slice(0, 1)).map((category, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer py-4 px-2 gap-2 rounded-lg flex flex-col justify-center items-center transition w-40"
                    style={{ backgroundColor: category.bgColor }}
                    onClick={() => {
                      if (!expandedCategories[group.key] && index === 0) {
                        // If collapsed and first item clicked, expand
                        toggleCategory(group.key);
                      } else {
                        // Select this category to show only its items
                        selectCategory(group.key);
                      }
                    }}
                  >
                    <img
                      src={category.image}
                      alt={category.text}
                      className="group-hover:scale-110 transition-transform max-w-20"
                    />
                    <p className="text-xs font-medium mt-2 text-center">{category.text}</p>
                    
                    {/* Show price when expanded or when selected category */}
                    {(expandedCategories[group.key] || selectedCategory === group.key) && category.price && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-green-600">Rs. {category.price}</span>
                        {category.oldPrice && (
                          <span className="text-xs text-gray-500 line-through">Rs. {category.oldPrice}</span>
                        )}
                      </div>
                    )}
                    
                    {!expandedCategories[group.key] && index === 0 && group.items.length > 1 && (
                      <p className="text-xs text-gray-600 mt-1">+{group.items.length - 1} more</p>
                    )}
                  </div>
                ))}
                
                {expandedCategories[group.key] && group.items.length > 1 && (
                  <div
                    className="group cursor-pointer py-4 px-2 gap-2 rounded-lg flex flex-col justify-center items-center transition bg-gray-100 hover:bg-gray-200 w-40"
                    onClick={() => toggleCategory(group.key)}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium mt-2 text-gray-600">Show Less</p>
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