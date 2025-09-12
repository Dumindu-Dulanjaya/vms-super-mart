import React from 'react';
import { categories } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const Categories = () => {
  const { navigate } = useAppContext();

  // Manually define category groups based on path
  const toysItems = categories.filter(item => item.path === 'Toys');
  const kitchenItems = categories.filter(item => item.path === 'Kitchen');

  const categoryGroups = [
    { title: 'Toys', items: toysItems },
    { title: 'Kitchen Items', items: kitchenItems }
  ];

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Categories</p>
      
      {categoryGroups.map((group, groupIndex) => (
        group.items.length > 0 && (
          <div key={groupIndex} className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">{group.title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-6">
              {group.items.map((category, index) => (
                <div
                  key={index}
                  className="group cursor-pointer py-5 px-3 gap-2 rounded-lg flex flex-col justify-center items-center transition"
                  style={{ backgroundColor: category.bgColor }}
                  onClick={() => {
                    navigate(`/products/${category.path.toLowerCase()}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <img
                    src={category.image}
                    alt={category.text}
                    className="group-hover:scale-110 transition-transform max-w-28"
                  />
                  <p className="text-sm font-medium mt-2">{category.text}</p>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default Categories;