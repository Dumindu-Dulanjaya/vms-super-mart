import React from 'react'
import { useAppContext } from '../context/useAppContext'
import { useParams } from 'react-router-dom';   
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';

const ProductCategory = () => {
    const { products } = useAppContext();
    const { category } = useParams();
    const selectedCategory = categories.find((item) => item.path.toLowerCase() === category);
    const filteredProducts = products.filter((product) => product.category.toLowerCase() === category);
  
    return (
    <div className='mt-16'>
        {selectedCategory && (
            <div className='flex flex-col'>
              <div className='flex flex-col items-end w-max mb-8'>
                <p className='text-2xl font-medium uppercase text-black'>{selectedCategory.text}</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
              </div>
              
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
