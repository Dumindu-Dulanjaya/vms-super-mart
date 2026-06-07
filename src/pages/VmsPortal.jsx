import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  X, 
  Percent, 
  Truck, 
  Tag, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import './vms-portal.css';

// Mock Product Database
const GROCERY_PRODUCTS = [
  {
    id: 1,
    name: 'Local Red Onions',
    unit: '500g',
    price: 180,
    oldPrice: 220,
    discount: '18% OFF',
    category: 'Fresh Vegetables',
    tag: 'Fresh',
    image: 'https://cdn-icons-png.flaticon.com/512/3501/3501869.png', // Onion vector icon
    description: 'Freshly harvested local red onions. Perfect as a base for Sri Lankan curries, salads, and everyday cooking.',
    stock: 'In Stock',
    weightOptions: ['250g', '500g', '1kg']
  },
  {
    id: 2,
    name: 'Organic Carrots',
    unit: '500g',
    price: 240,
    oldPrice: 280,
    discount: '14% OFF',
    category: 'Fresh Vegetables',
    tag: 'Organic',
    image: 'https://cdn-icons-png.flaticon.com/512/4056/4056860.png', // Carrot vector
    description: 'Crisp, sweet, and highly nutritious carrots grown without synthetic pesticides. Ideal for juices, salads, and soups.',
    stock: 'In Stock',
    weightOptions: ['500g', '1kg']
  },
  {
    id: 3,
    name: 'Imported Gala Apples',
    unit: '1kg',
    price: 650,
    oldPrice: 750,
    discount: '13% OFF',
    category: 'Fruits',
    tag: 'Imported',
    image: 'https://cdn-icons-png.flaticon.com/512/415/415733.png', // Apple vector
    description: 'Crisp and exceptionally sweet Gala apples imported fresh. High in dietary fiber and essential vitamins.',
    stock: 'In Stock',
    weightOptions: ['500g', '1kg', '2kg']
  },
  {
    id: 4,
    name: 'Organic Avocado',
    unit: 'Single',
    price: 120,
    oldPrice: 150,
    discount: '20% OFF',
    category: 'Fruits',
    tag: 'Organic',
    image: 'https://cdn-icons-png.flaticon.com/512/2909/2909772.png', // Avocado vector
    description: 'Buttery, rich local avocados. Perfect for smoothies, healthy spreads, or as a fresh addition to salads.',
    stock: 'Low Stock',
    weightOptions: ['Single', 'Pack of 3']
  },
  {
    id: 5,
    name: 'Fresh Dairy Milk',
    unit: '1L',
    price: 450,
    oldPrice: 480,
    discount: '6% OFF',
    category: 'Dairy & Eggs',
    tag: 'Fresh',
    image: 'https://cdn-icons-png.flaticon.com/512/372/372982.png', // Milk vector
    description: '100% pure pasteurized fresh cow milk. Sourced from local dairy farms and packed with calcium and protein.',
    stock: 'In Stock',
    weightOptions: ['500ml', '1L']
  },
  {
    id: 6,
    name: 'Cheddar Cheese Block',
    unit: '200g',
    price: 850,
    oldPrice: 950,
    discount: '10% OFF',
    category: 'Dairy & Eggs',
    tag: 'Premium',
    image: 'https://cdn-icons-png.flaticon.com/512/2206/2206179.png', // Cheese vector
    description: 'Rich, creamy cheddar cheese block aged for premium sharp flavor. Perfect for sandwiches, grating, and melting.',
    stock: 'In Stock',
    weightOptions: ['200g', '500g']
  },
  {
    id: 7,
    name: 'Fresh Chicken Breast',
    unit: '500g',
    price: 720,
    oldPrice: 800,
    discount: '10% OFF',
    category: 'Meat & Seafood',
    tag: 'Fresh',
    image: 'https://cdn-icons-png.flaticon.com/512/1041/1041375.png', // Chicken vector
    description: 'Boneless, skinless fresh chicken breast. Lean meat source packed with protein, prepared under strict hygienic standards.',
    stock: 'In Stock',
    weightOptions: ['500g', '1kg']
  },
  {
    id: 8,
    name: 'Coca-Cola Zero Can',
    unit: '330ml',
    price: 180,
    oldPrice: 180,
    discount: '',
    category: 'Beverages',
    tag: 'Popular',
    image: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', // Can vector
    description: 'The great refreshing taste of Coca-Cola with zero sugar. Serve chilled for maximum refreshment.',
    stock: 'In Stock',
    weightOptions: ['330ml', '6-Pack']
  }
];

const PROMOTIONS = [
  {
    id: 1,
    title: 'Flat 20% off on Veggies',
    desc: 'Fresh farm harvest deals',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
  },
  {
    id: 2,
    title: 'Mega Weekend Grocery Sale',
    desc: 'Up to 30% savings on essentials',
    bg: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)'
  },
  {
    id: 3,
    title: 'Buy 1 Get 1 Free on Beverages',
    desc: 'Quench your thirst this weekend',
    bg: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)'
  }
];

const CATEGORIES = ['All', 'Fresh Vegetables', 'Fruits', 'Dairy & Eggs', 'Meat & Seafood', 'Beverages'];

const VmsPortal = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('Main Outlet (Colombo)');
  const [promoIndex, setPromoIndex] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0); // Rs. discount amount
  const [selectedWeight, setSelectedWeight] = useState('');

  // Auto-rotate promo slides
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % PROMOTIONS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Sync weight option on product selection
  useEffect(() => {
    if (selectedProduct) {
      setSelectedWeight(selectedProduct.weightOptions[0]);
    }
  }, [selectedProduct]);

  // Cart operations
  const addToCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    toast.success('Added to cart!');
  };

  const updateQuantity = (productId, change) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + change;
      const updated = { ...prev };
      if (next <= 0) {
        delete updated[productId];
        toast('Removed from cart', { icon: '🗑️' });
      } else {
        updated[productId] = next;
      }
      return updated;
    });
  };

  // Get total items count
  const getCartCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  // Pricing calculations
  const getSubtotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = GROCERY_PRODUCTS.find(p => p.id === parseInt(id));
      return sum + (product ? product.price * qty : 0);
    }, 0);
  };

  const getSavings = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = GROCERY_PRODUCTS.find(p => p.id === parseInt(id));
      if (product && product.oldPrice > product.price) {
        return sum + ((product.oldPrice - product.price) * qty);
      }
      return sum;
    }, 0);
  };

  const getDeliveryFee = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 2000 ? 0 : 250; // Free delivery above Rs.2000
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal + getDeliveryFee() - discountApplied;
  };

  // Coupon activation
  const handleApplyCoupon = () => {
    if (coupon.toLowerCase() === 'vms20') {
      const discount = Math.round(getSubtotal() * 0.2); // 20% discount
      setDiscountApplied(discount);
      toast.success('Coupon VMS20 applied! 20% savings added.');
    } else {
      toast.error('Invalid coupon code. Try VMS20!');
    }
  };

  const handleCheckout = () => {
    toast.loading('Processing order...', { id: 'checkout-toast' });
    setTimeout(() => {
      toast.dismiss('checkout-toast');
      toast.success('Order placed successfully! Connecting delivery rider.');
      setCart({});
      setIsCartOpen(false);
      setDiscountApplied(0);
      setCoupon('');
    }, 1500);
  };

  // Filter products
  const filteredProducts = GROCERY_PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="portal-wrapper">
      <div className="portal-container">
        
        {/* Sticky App Header */}
        <header className="portal-header">
          <div className="portal-header-top">
            <div className="portal-location-selector">
              <MapPin className="text-[#00FF33]" size={16} />
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="portal-location-select"
              >
                <option value="Main Outlet (Colombo)">Main Outlet (Colombo)</option>
                <option value="Kandy Branch">Kandy Branch</option>
                <option value="Galle Outlet">Galle Outlet</option>
                <option value="Negombo Branch">Negombo Branch</option>
              </select>
            </div>
            
            <div 
              className="portal-cart-trigger" 
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={20} />
              {getCartCount() > 0 && (
                <div className="portal-cart-badge">{getCartCount()}</div>
              )}
            </div>
          </div>
          
          <div className="portal-search-bar">
            <Search className="text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search vegetables, fruits, dairy..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="portal-search-input"
            />
            {searchQuery && (
              <X 
                className="text-slate-400 cursor-pointer" 
                size={16} 
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
        </header>

        {/* Promo Offers Carousel */}
        <section className="portal-carousel">
          <div className="portal-carousel-track">
            {PROMOTIONS.map((promo, idx) => (
              <div 
                key={promo.id} 
                className="portal-carousel-slide"
                style={{ 
                  background: promo.bg,
                  transform: `translateX(${(idx - promoIndex) * 100}%)`,
                  display: idx === promoIndex ? 'flex' : 'none'
                }}
              >
                <div className="portal-carousel-overlay">
                  <span className="portal-carousel-desc">{promo.desc}</span>
                  <h3 className="portal-carousel-title">{promo.title}</h3>
                </div>
              </div>
            ))}
          </div>
          <div className="portal-carousel-dots">
            {PROMOTIONS.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setPromoIndex(idx)}
                className={`portal-carousel-dot ${idx === promoIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </section>

        {/* Horizontal Category Pill Selector */}
        <section className="portal-categories-section">
          <div className="portal-categories-swiper">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`portal-category-pill ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Double-Column Product Grid */}
        <section className="portal-products-section">
          <div className="portal-section-header">
            <span className="portal-section-header-dot"></span>
            <h3>{activeCategory} ({filteredProducts.length})</h3>
          </div>
          
          <div className="portal-product-grid">
            {filteredProducts.map(product => {
              const qty = cart[product.id] || 0;
              return (
                <div key={product.id} className="portal-product-card">
                  {product.discount && (
                    <div className="portal-card-badge">{product.discount}</div>
                  )}
                  
                  <div 
                    className="portal-product-img-wrapper"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="portal-product-img"
                    />
                  </div>
                  
                  <div className="portal-product-info">
                    <span className="portal-product-unit">{product.unit}</span>
                    <h4 
                      className="portal-product-name"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.name}
                    </h4>
                    
                    <div className="portal-product-pricing">
                      <span className="portal-product-price">Rs.{product.price}</span>
                      {product.oldPrice > product.price && (
                        <span className="portal-product-old-price">Rs.{product.oldPrice}</span>
                      )}
                    </div>

                    <div className="portal-add-btn-wrapper">
                      {qty === 0 ? (
                        <button 
                          onClick={() => addToCart(product.id)}
                          className="portal-add-btn"
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <div className="portal-qty-selector">
                          <button 
                            onClick={() => updateQuantity(product.id, -1)}
                            className="portal-qty-btn"
                          >
                            <Minus size={12} />
                          </button>
                          <span>{qty}</span>
                          <button 
                            onClick={() => updateQuantity(product.id, 1)}
                            className="portal-qty-btn"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sticky Bottom Cart Bar */}
        {getCartCount() > 0 && !isCartOpen && (
          <div className="portal-bottom-cart-bar">
            <div className="portal-bar-left">
              <span className="portal-bar-qty">{getCartCount()} Item{getCartCount() > 1 ? 's' : ''} added</span>
              <span className="portal-bar-total">Rs.{getSubtotal()}</span>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="portal-bar-btn"
            >
              <span>View Cart</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Slide-Up Cart & Checkout Drawer Sheet */}
        {isCartOpen && (
          <div className="portal-sheet-backdrop" onClick={() => setIsCartOpen(false)}>
            <div className="portal-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="portal-sheet-handle" onClick={() => setIsCartOpen(false)}></div>
              
              <div className="portal-sheet-header">
                <h3 className="portal-sheet-title">My Cart ({getCartCount()})</h3>
                <button 
                  className="portal-sheet-close"
                  onClick={() => setIsCartOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Items List */}
              <div className="portal-cart-list">
                {Object.keys(cart).length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold text-xs uppercase">Your cart is empty</p>
                  </div>
                ) : (
                  Object.entries(cart).map(([id, qty]) => {
                    const product = GROCERY_PRODUCTS.find(p => p.id === parseInt(id));
                    if (!product) return null;
                    return (
                      <div key={product.id} className="portal-cart-item">
                        <div className="portal-cart-item-img-wrapper">
                          <img src={product.image} alt={product.name} className="portal-cart-item-img" />
                        </div>
                        <div className="portal-cart-item-details">
                          <h4 className="portal-cart-item-name">{product.name}</h4>
                          <span className="portal-cart-item-price">Rs.{product.price * qty}</span>
                        </div>
                        <div className="portal-cart-item-controls">
                          <button 
                            onClick={() => updateQuantity(product.id, -1)}
                            className="portal-cart-item-btn"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="portal-cart-item-qty">{qty}</span>
                          <button 
                            onClick={() => updateQuantity(product.id, 1)}
                            className="portal-cart-item-btn"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Promo Coupon Application */}
              {getCartCount() > 0 && (
                <div className="portal-coupon-section">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon (VMS20)" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="portal-coupon-input"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="portal-coupon-btn"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Pricing Breakdown */}
              {getCartCount() > 0 && (
                <>
                  <div className="portal-bill-breakdown">
                    <div className="portal-bill-row">
                      <span>Subtotal</span>
                      <span>Rs.{getSubtotal()}</span>
                    </div>
                    {getSavings() > 0 && (
                      <div className="portal-bill-row savings">
                        <span>Product Savings</span>
                        <span>-Rs.{getSavings()}</span>
                      </div>
                    )}
                    {discountApplied > 0 && (
                      <div className="portal-bill-row savings">
                        <span>Promo Discount</span>
                        <span>-Rs.{discountApplied}</span>
                      </div>
                    )}
                    <div className="portal-bill-row">
                      <span>Delivery Fee</span>
                      <span>{getDeliveryFee() === 0 ? 'FREE' : `Rs.${getDeliveryFee()}`}</span>
                    </div>
                    <div className="portal-bill-row total">
                      <span>Grand Total</span>
                      <span>Rs.{getTotal()}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button 
                    onClick={handleCheckout}
                    className="portal-checkout-btn"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Product Details Slide-up Sheet */}
        {selectedProduct && (
          <div className="portal-sheet-backdrop" onClick={() => setSelectedProduct(null)}>
            <div className="portal-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="portal-sheet-handle" onClick={() => setSelectedProduct(null)}></div>
              
              <div className="portal-sheet-header">
                <h3 className="portal-sheet-title">{selectedProduct.name}</h3>
                <button 
                  className="portal-sheet-close"
                  onClick={() => setSelectedProduct(null)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Detail Image */}
              <div className="portal-details-img-container">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="portal-details-img"
                />
              </div>

              {/* Detail Meta */}
              <div className="portal-details-meta">
                <span className="portal-product-price text-lg">Rs.{selectedProduct.price}</span>
                <span className="portal-details-stock-badge">{selectedProduct.stock}</span>
              </div>

              {/* Description */}
              <p className="portal-details-desc">{selectedProduct.description}</p>

              {/* Weight Options */}
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2.5 block">Select Portion Size:</span>
              <div className="portal-details-weight-options">
                {selectedProduct.weightOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSelectedWeight(opt)}
                    className={`portal-weight-btn ${selectedWeight === opt ? 'active' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Add to Cart Actions inside Details Sheet */}
              <div className="pt-4 border-t border-slate-800">
                {cart[selectedProduct.id] ? (
                  <div className="portal-qty-selector py-3">
                    <button 
                      onClick={() => updateQuantity(selectedProduct.id, -1)}
                      className="portal-qty-btn"
                    >
                      <Minus size={14} />
                    </button>
                    <span>{cart[selectedProduct.id]} Items in Cart</span>
                    <button 
                      onClick={() => updateQuantity(selectedProduct.id, 1)}
                      className="portal-qty-btn"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(selectedProduct.id)}
                    className="portal-checkout-btn"
                  >
                    <ShoppingBag size={16} />
                    <span>Add to Basket - Rs.{selectedProduct.price}</span>
                  </button>
                )}
              </div>

              {/* Recommendations cross-sell */}
              <div className="portal-recommendations">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Frequently Bought Together:</span>
                <div className="portal-recommend-grid">
                  {GROCERY_PRODUCTS
                    .filter(p => p.id !== selectedProduct.id && p.category === selectedProduct.category)
                    .slice(0, 2)
                    .map(rec => (
                      <div 
                        key={rec.id} 
                        className="portal-recommend-card"
                        onClick={() => setSelectedProduct(rec)}
                      >
                        <img src={rec.image} alt={rec.name} className="portal-recommend-img" />
                        <div>
                          <h5 className="portal-recommend-name">{rec.name}</h5>
                          <span className="portal-recommend-price">Rs.{rec.price}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VmsPortal;
