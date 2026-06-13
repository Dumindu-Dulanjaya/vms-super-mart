import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard'
import { SlidersHorizontal, X } from 'lucide-react'

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  useEffect(() => {
    let filtered = products;

    // Filter by category from URL
    if (categoryFilter) {
      filtered = filtered.filter((product) =>
        product.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // Filter by search query
    if (searchQuery.length > 0) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter((product) =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by rating
    if (selectedRating > 0) {
      filtered = filtered.filter((product) => product.rating >= selectedRating);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // featured - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products, categoryFilter, priceRange, selectedRating, sortBy, selectedCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, priceRange, selectedRating, sortBy, selectedCategories]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedRating(0);
    setSelectedCategories([]);
    setSortBy('featured');
  };

  return (
    <div className="mt-8 mb-16">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {categoryFilter ? categoryFilter.toUpperCase() : 'ALL PRODUCTS'}
            </h1>
            <div className="w-20 h-1 bg-green-600 rounded-none"></div>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-none hover:bg-gray-50"
          >
            <SlidersHorizontal size={20} />
            Filters
          </button>
        </div>

        {/* Horizontal scroll style category tabs (like the reference) */}
        <div className="flex sm:hidden gap-6 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-slate-200 select-none">
          <button
            onClick={() => setSelectedCategories([])}
            className={`whitespace-nowrap pb-2 text-xs font-black uppercase tracking-wider relative transition-colors ${
              selectedCategories.length === 0 ? 'text-green-600 border-b-2 border-[#00F631]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            All Collections
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategories([cat])}
                className={`whitespace-nowrap pb-2 text-xs font-black uppercase tracking-wider relative transition-colors ${
                  isActive ? 'text-green-600 border-b-2 border-[#00F631]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block fixed lg:static inset-0 z-50 lg:z-auto bg-black bg-opacity-50 lg:bg-transparent`}>
            <div className="absolute lg:static left-0 top-0 bottom-0 w-80 lg:w-64 bg-white p-6 overflow-y-auto lg:border lg:border-gray-200 lg:rounded-none">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="text-lg font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X size={24} />
                </button>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              {/* Categories */}
              {!categoryFilter && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-none">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-4 h-4 text-green-600 rounded-none focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rs. 0</span>
                    <span>Rs. {priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-none">
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === rating}
                        onChange={() => setSelectedRating(rating)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex items-center gap-1">
                        {Array(5).fill('').map((_, i) => (
                          <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                        <span className="text-sm text-gray-600 ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-none hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {(() => {
              const inStockProducts = filteredProducts.filter((product) => (product.instock ?? true));
              const totalPages = Math.ceil(inStockProducts.length / itemsPerPage);
              const paginatedProducts = inStockProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

              return (
                <>
                  {/* Results count */}
                  <div className="mb-4 text-gray-600 text-xs font-black uppercase tracking-wider">
                    {inStockProducts.length > 0 ? (
                      <span>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, inStockProducts.length)}-{Math.min(currentPage * itemsPerPage, inStockProducts.length)} of {inStockProducts.length} products</span>
                    ) : (
                      <span>Showing 0 products</span>
                    )}
                  </div>

                  {paginatedProducts.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-xl text-gray-500">
                        {searchQuery ? 'No products found matching your search.' : 'Loading products...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {paginatedProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setCurrentPage(prev => Math.max(prev - 1, 1));
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            Prev
                          </button>
                          
                          {Array.from({ length: totalPages }).map((_, idx) => {
                            const pageNum = idx + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => {
                                  setCurrentPage(pageNum);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-9 h-9 text-xs font-black transition-all cursor-pointer border ${
                                  currentPage === pageNum
                                    ? 'bg-slate-900 text-[#00FF33] border-slate-900 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => {
                              setCurrentPage(prev => Math.min(prev + 1, totalPages));
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllProducts