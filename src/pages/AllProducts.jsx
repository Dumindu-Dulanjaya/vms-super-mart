import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard'
import { Search } from 'lucide-react'

const AllProducts = () => {
  const { products, searchQuery, setSearchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);

  console.log('AllProducts - products from context:', products.length);
  console.log('AllProducts - searchQuery:', searchQuery);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">ALL PRODUCTS</h1>
              <div className="w-20 h-1 bg-green-600 rounded-full"></div>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full bg-white shadow-sm w-full md:w-96">
              <Search size={20} className="text-gray-400" />
              <input 
                className="w-full bg-transparent outline-none placeholder-gray-400" 
                type="text" 
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Search Results Info */}
          {searchQuery && (
            <p className="text-gray-600 text-sm mt-4">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
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
