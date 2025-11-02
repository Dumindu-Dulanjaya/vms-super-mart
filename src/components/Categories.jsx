import React, { useState } from 'react';
import { categories } from '../assets/assets';
import { useAppContext } from '../context/useAppContext';

const Categories = () => {
  const { navigate } = useAppContext();
  const [expandedCategories, setExpandedCategories] = useState({});

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

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Categories</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        {categoryGroups.map((group, groupIndex) => (
          group.items.length > 0 && (
            <div key={groupIndex} className="flex flex-col">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">{group.title}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(expandedCategories[group.key] ? group.items : group.items.slice(0, 1)).map((category, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer py-4 px-2 gap-2 rounded-lg flex flex-col justify-center items-center transition"
                    style={{ backgroundColor: category.bgColor }}
                    onClick={() => {
                      if (!expandedCategories[group.key] && index === 0) {
                        // If collapsed and first item clicked, expand
                        toggleCategory(group.key);
                      } else {
                        // Navigate to products
                        navigate(`/products/${category.path.toLowerCase()}`);
                        window.scrollTo(0, 0);
                      }
                    }}
                  >
                    <img
                      src={category.image}
                      alt={category.text}
                      className="group-hover:scale-110 transition-transform max-w-20"
                    />
                    <p className="text-xs font-medium mt-2 text-center">{category.text}</p>
                    {!expandedCategories[group.key] && index === 0 && group.items.length > 1 && (
                      <p className="text-xs text-gray-600 mt-1">+{group.items.length - 1} more</p>
                    )}
                  </div>
                ))}
                
                {expandedCategories[group.key] && group.items.length > 1 && (
                  <div
                    className="group cursor-pointer py-4 px-2 gap-2 rounded-lg flex flex-col justify-center items-center transition bg-gray-100 hover:bg-gray-200"
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