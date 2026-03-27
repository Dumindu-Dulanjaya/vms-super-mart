import React from 'react'
import { useAppContext } from '../context/useAppContext'
import { useParams } from 'react-router-dom';   
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';

const ProductCategory = () => {
    const { products } = useAppContext();
    const { category } = useParams();
    const selectedCategory = categories.find((item) => item.path.toLowerCase() === category);
    
    // Filter products by the category type (e.g., "Toys", "Kitchen Items")
    const filteredProducts = products.filter((product) => {
      // Match against the type field from categories, which is the actual category value
      const categoryType = selectedCategory?.type || selectedCategory?.path;
      return product.category.toLowerCase() === categoryType?.toLowerCase();
    });
    
    return (
    <div className='mt-16'>
        {selectedCategory && (
            <div className='flex flex-col'>
              {/* Category Title - Left aligned */}
              <div className='mb-8'>
                <h1 className='text-3xl md:text-4xl font-bold text-gray-800'>
                  {selectedCategory.type || selectedCategory.path}
                </h1>
              </div>
              
              {/* Products Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <p className='text-gray-500 col-span-full text-center py-10'>No products found in this category.</p>
                )}
              </div>
            </div>
        )}
        
        {!selectedCategory && (
          <div className='text-center py-10'>
            <p className='text-gray-500'>Category not found.</p>
          </div>
        )}
    </div>
  )
}

export default ProductCategory
