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
  Sparkles,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import './vms-portal.css';

const PROMOTIONS = [
  {
    id: 1,
    title: 'Flat 20% off on Veggies',
    desc: 'Fresh farm harvest deals',
    bg: 'linear-gradient(135deg, #090e18 0%, #161e31 100%)'
  },
  {
    id: 2,
    title: 'Mega Weekend Grocery Sale',
    desc: 'Up to 30% savings on essentials',
    bg: 'linear-gradient(135deg, #063121 0%, #0c4d35 100%)'
  },
  {
    id: 3,
    title: 'Buy 1 Get 1 Free on Beverages',
    desc: 'Quench your thirst this weekend',
    bg: 'linear-gradient(135deg, #101c3d 0%, #1b2f67 100%)'
  }
];

const VmsPortal = () => {
  const { products } = useAppContext();
  const GROCERY_PRODUCTS = products || [];

  const CATEGORIES = ['All', ...new Set(GROCERY_PRODUCTS.map(p => p.category).filter(Boolean))];

  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      const opts = selectedProduct.weightOptions || ['1 Unit'];
      setSelectedWeight(opts[0]);
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
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="portal-menu-btn"
                aria-label="Toggle Menu"
              >
                <Menu size={22} />
              </button>
              
              <div className="portal-brand">
                <span className="portal-brand-light">VMS</span>
                <span className="portal-brand-accent">MART</span>
              </div>
            </div>

            <div 
              className="portal-cart-trigger" 
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={18} />
              {getCartCount() > 0 && (
                <div className="portal-cart-badge">{getCartCount()}</div>
              )}
            </div>
          </div>

          <div className="portal-header-bottom">
            <div className="portal-location-selector">
              <MapPin size={13} className="text-[#00F631]" />
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
          </div>
          
          <div className="portal-search-bar">
            <Search className="text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products, groceries..." 
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

        {/* Sliding Menu Drawer */}
        {isMenuOpen && (
          <div className="portal-drawer-backdrop" onClick={() => setIsMenuOpen(false)}>
            <div className="portal-menu-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="portal-drawer-header">
                <div className="portal-brand text-lg">
                  <span className="portal-brand-light">VMS</span>
                  <span className="portal-brand-accent">MART</span>
                </div>
                <button 
                  className="portal-drawer-close"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="portal-drawer-content">
                {/* User Info */}
                <div className="portal-drawer-user-card">
                  <div className="portal-user-avatar">
                    <span className="font-bold text-[#00F631]">U</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">Shopper Account</p>
                    <p className="text-[10px] text-slate-500 font-semibold">Active Session</p>
                  </div>
                </div>

                <div className="portal-drawer-divider"></div>

                {/* Categories */}
                <div className="portal-drawer-section">
                  <h4 className="portal-drawer-section-title">Shop Categories</h4>
                  <div className="portal-drawer-links">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setIsMenuOpen(false);
                        }}
                        className={`portal-drawer-link-btn ${activeCategory === cat ? 'active' : ''}`}
                      >
                        <span className="portal-link-dot"></span>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="portal-drawer-divider"></div>

                {/* Support Info */}
                <div className="portal-drawer-section">
                  <h4 className="portal-drawer-section-title">Support & Info</h4>
                  <div className="portal-drawer-info-list text-xs text-slate-400 space-y-3 mt-1">
                    <p className="flex items-center gap-2">
                      <Truck size={14} className="text-[#00F631]" /> Free Delivery over Rs.2,000
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#00F631]" /> Islandwide Delivery outlets
                    </p>
                    <p className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 
                      +94 11 234 5678
                    </p>
                  </div>
                </div>
              </div>

              <div className="portal-drawer-footer">
                <p className="text-[10px] text-slate-500 font-bold text-center">VMS SUPER MART v1.5</p>
              </div>
            </div>
          </div>
        )}

        {/* Promo Offers Carousel */}
        <section className="portal-carousel">
          <div className="portal-carousel-track">
            {PROMOTIONS.map((promo, idx) => (
              <div 
                key={promo.id} 
                className={`portal-carousel-slide ${idx === promoIndex ? 'active' : ''}`}
                style={{ 
                  background: promo.bg
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
                  {product.oldPrice > product.price && (
                    <div className="portal-card-badge">
                      {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                    </div>
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
                    <span className="portal-product-unit">{product.unit || '1 Unit'}</span>
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

        {/* Footer section */}
        <footer className="portal-footer">
          <div className="portal-footer-divider"></div>
          <div className="portal-footer-content">
            <div className="portal-brand text-sm mb-2">
              <span className="portal-brand-light">VMS</span>
              <span className="portal-brand-accent">MART</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-5">
              Premium fresh groceries, dairy, beverages and daily essentials delivered directly to your doorstep. Experience modern digital shopping.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-[11px] text-slate-400">
              <div>
                <h5 className="text-white font-bold uppercase tracking-wider mb-2 text-[10px]">Store Outlets</h5>
                <ul className="space-y-1 text-slate-400">
                  <li>Colombo Outlet</li>
                  <li>Kandy Branch</li>
                  <li>Galle Outlet</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-bold uppercase tracking-wider mb-2 text-[10px]">Customer Support</h5>
                <ul className="space-y-1 text-slate-400">
                  <li>Help Center</li>
                  <li>Delivery Policy</li>
                  <li>Terms of Service</li>
                </ul>
              </div>
            </div>

            <div className="portal-footer-bottom">
              <p className="text-[9px] text-slate-500 font-bold mb-0">
                © {new Date().getFullYear()} VMS Super Mart. All Rights Reserved.
              </p>
              
              <div className="portal-social-links">
                <a href="#" aria-label="Facebook" className="portal-social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className="portal-social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" aria-label="Twitter" className="portal-social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </footer>

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
                <span className="portal-details-stock-badge">{selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
              </div>

              {/* Description */}
              <p className="portal-details-desc">{selectedProduct.description}</p>

              {/* Weight Options */}
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2.5 block">Select Portion Size:</span>
              <div className="portal-details-weight-options">
                {(selectedProduct.weightOptions || ['1 Unit']).map(opt => (
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
