import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

const AllProducts = () => {
  const { products, searchQuery} = useAppContext();
  const[filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setFilteredProducts(
        products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  return (
    <div className="mt-16">
      <div className="container mx-auto px-8">
        <div className="flex flex-col items-start w-full">
        <p className="text-2xl font-medium uppercase text-black mb-2 text-left">All Products</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>

  {/* Product grid: responsive horizontal layout */}
  <div className="mt-6">
    <div className="container mx-auto px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts
          .filter((product) => (product.instock ?? true))
          .map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
      </div>
    </div>
  </div>
      </div>
    </div>
  );
}

export default AllProducts
