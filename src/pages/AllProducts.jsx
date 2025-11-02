import React, { useEffect } from 'react'
import { useAppContext } from '../context/useAppContext'
import ProductCard from '../components/ProductCard'

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = React.useState([])

  useEffect(() => {
    if (searchQuery && searchQuery.length) {
      const q = searchQuery.toLowerCase();
      const filtered = (products || []).filter(p => {
        const name = (p?.name || '').toLowerCase();
        const desc = (p?.description || '').toLowerCase();
        const cat = (p?.category || '').toLowerCase();
        return name.includes(q) || desc.includes(q) || cat.includes(q);
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products || []);
    }
  }, [searchQuery, products]);

  return (
    <div className="mt-16 flex flex-col">
      <div className="flex flex-col items-end w-max">
        <p className="text-2xl font-medium uppercase text-black mb-2">All Products &gt; All Products</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default AllProducts
