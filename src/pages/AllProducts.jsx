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
      <div className="flex flex-col items-end w-max">
        <p className="text-2xl font-medium uppercase text-black mb-2">All Products &gt; All Products</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>

      {/* Two-column layout: left narrow column with stacked product cards, right main area for content */}
      <div className="flex gap-8 mt-6">
        {/* Left column: stacked product cards */}
        <aside className="w-80">
          <div className="space-y-4">
                {filteredProducts
                  .filter((product) => (product.instock ?? true))
                  .map((product, index) => (
                    <ProductCard key={index} product={product} />
                  ))}
          </div>
        </aside>

        {/* Right main area: keep empty or use for filters / product details later */}
        <main className="flex-1">
          {/* Placeholder area to match reference layout; content can be added here later */}
          <div className="min-h-[400px] bg-white"></div>
        </main>
      </div>
    </div>
  );
}

export default AllProducts
