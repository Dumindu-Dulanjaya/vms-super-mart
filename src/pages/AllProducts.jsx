import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

const AllProducts = () => {
  const { products, searchQuery} = useAppContext();
  const[filteredProducts, setFilteredProducts] = useState([]);

  console.log('AllProducts - products from context:', products.length);
  console.log('AllProducts - searchQuery:', searchQuery);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
      console.log('AllProducts - filtered by search:', filtered.length);
    } else {
      setFilteredProducts(products);
      console.log('AllProducts - showing all products:', products.length);
    }
  }, [searchQuery, products]);

  return (
    <div className="mt-8 mb-16">
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ALL PRODUCTS</h1>
          <div className="w-20 h-1 bg-green-600 rounded-full"></div>
        </div>

        {/* Product grid: 5 columns on large screens */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">
              {searchQuery ? 'No products found matching your search.' : 'Loading products...'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts
              .filter((product) => (product.instock ?? true))
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllProducts
