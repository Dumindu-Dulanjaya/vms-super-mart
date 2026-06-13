import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ShoppingBag, 
  Plus, 
  Minus, 
  ChevronRight, 
  X, 
  Truck, 
  ArrowRight,
  Menu,
  ChevronDown,
  Mail
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

  // Newsletter states
  const [menuEmail, setMenuEmail] = useState('');
  const [footerEmail, setFooterEmail] = useState('');

  // Accordion states
  const [openDrawerAccordions, setOpenDrawerAccordions] = useState({
    mainMenu: true,
    links: false,
    contactUs: false
  });

  const [openFooterAccordions, setOpenFooterAccordions] = useState({
    storeOutlets: true,
    customerSupport: false,
    quickLinks: false
  });

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

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

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

  const handleSubscribeMenu = (e) => {
    e.preventDefault();
    if (!menuEmail.trim()) return;
    toast.success('Thank you for subscribing to VMS Mart newsletter!');
    setMenuEmail('');
  };

  const handleSubscribeFooter = (e) => {
    e.preventDefault();
    if (!footerEmail.trim()) return;
    toast.success('Thank you for subscribing to VMS Mart newsletter!');
    setFooterEmail('');
  };

  const toggleDrawerAccordion = (section) => {
    setOpenDrawerAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFooterAccordion = (section) => {
    setOpenFooterAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredProducts = GROCERY_PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="portal-wrapper">
      <div className="portal-container">
        
        {/* Top promo alert banner */}
        <div className="portal-top-banner">
          <span>10% DISCOUNT ON YOUR FIRST ORDER | FRESH INGREDIENTS</span>
        </div>

        {/* Sticky Premium Header */}
        <header className="portal-header">
          <div className="portal-header-top">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="portal-menu-btn"
              aria-label="Toggle Menu"
            >
              <Menu size={24} />
            </button>
            
            {/* Centered Brand Logo */}
            <div className="portal-brand-centered">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="portal-brand-icon">
                <path d="M10 32V14C10 10.6863 12.6863 8 16 8H24C27.3137 8 30 10.6863 30 14V32" stroke="#00F631" strokeWidth="4.5" strokeLinecap="round"/>
                <path d="M20 32V20C20 18.8954 20.8954 18 22 18H28C29.1046 18 30 18.8954 30 20V32" stroke="#00F631" strokeWidth="4.5" strokeLinecap="round"/>
              </svg>
              <span className="portal-brand-text">VMS</span>
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

          {/* Location Selector Bar */}
          <div className="portal-header-bottom">
            <div className="portal-location-selector">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#00F631]" />
                <select 
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="portal-location-select"
                >
                  <option value="Main Outlet (Colombo)">MAIN OUTLET (COLOMBO)</option>
                  <option value="Kandy Branch">KANDY BRANCH</option>
                  <option value="Galle Outlet">GALLE OUTLET</option>
                  <option value="Negombo Branch">NEGOMBO BRANCH</option>
                </select>
              </div>
              <ChevronDown size={14} className="text-slate-500" />
            </div>
          </div>
          
          {/* Search Area */}
          <div className="portal-search-bar">
            <Search className="text-slate-400" size={18} />
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
                size={18} 
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
        </header>

        {/* Sliding Left Full-Screen Menu Drawer */}
        {isMenuOpen && (
          <div className="portal-drawer-backdrop" onClick={() => setIsMenuOpen(false)}>
            <div className="portal-menu-drawer animate-slide-in-left" onClick={(e) => e.stopPropagation()}>
              
              <div className="portal-drawer-header">
                {/* Centered Brand Logo inside drawer */}
                <div className="portal-brand-centered">
                  <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="portal-brand-icon">
                    <path d="M10 32V14C10 10.6863 12.6863 8 16 8H24C27.3137 8 30 10.6863 30 14V32" stroke="#00F631" strokeWidth="4.5" strokeLinecap="round"/>
                    <path d="M20 32V20C20 18.8954 20.8954 18 22 18H28C29.1046 18 30 18.8954 30 20V32" stroke="#00F631" strokeWidth="4.5" strokeLinecap="round"/>
                  </svg>
                  <span className="portal-brand-text">VMS</span>
                </div>
                
                <button 
                  className="portal-drawer-close"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="portal-drawer-content">
                
                {/* Search box inside drawer */}
                <div className="portal-drawer-search">
                  <Search size={16} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search groceries..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="portal-drawer-search-input"
                  />
                  {searchQuery && (
                    <X 
                      size={16} 
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 cursor-pointer"
                    />
                  )}
                </div>

                {/* Interactive Accordion Menus */}
                <div className="portal-accordions-group">
                  
                  {/* MAIN MENU */}
                  <div className="portal-accordion-item">
                    <button 
                      className="portal-accordion-trigger"
                      onClick={() => toggleDrawerAccordion('mainMenu')}
                    >
                      <span>MAIN MENU</span>
                      <ChevronRight size={16} className={`portal-accordion-arrow ${openDrawerAccordions.mainMenu ? 'rotate-90' : ''}`} />
                    </button>
                    {openDrawerAccordions.mainMenu && (
                      <div className="portal-accordion-panel">
                        <a href="/" className="portal-accordion-link">Home Portal</a>
                        <a href="/all-products" className="portal-accordion-link">Browse Catalog</a>
                        <a href="/my-orders" className="portal-accordion-link">My Purchase History</a>
                        <a href="/profile" className="portal-accordion-link">My Account Profile</a>
                      </div>
                    )}
                  </div>

                  {/* LINKS */}
                  <div className="portal-accordion-item">
                    <button 
                      className="portal-accordion-trigger"
                      onClick={() => toggleDrawerAccordion('links')}
                    >
                      <span>PRODUCT CATEGORIES</span>
                      <ChevronRight size={16} className={`portal-accordion-arrow ${openDrawerAccordions.links ? 'rotate-90' : ''}`} />
                    </button>
                    {openDrawerAccordions.links && (
                      <div className="portal-accordion-panel">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              setActiveCategory(cat);
                              setIsMenuOpen(false);
                            }}
                            className="portal-accordion-link text-left w-full bg-transparent border-none py-2 cursor-pointer font-bold block"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CONTACT US */}
                  <div className="portal-accordion-item">
                    <button 
                      className="portal-accordion-trigger"
                      onClick={() => toggleDrawerAccordion('contactUs')}
                    >
                      <span>CONTACT US</span>
                      <ChevronRight size={16} className={`portal-accordion-arrow ${openDrawerAccordions.contactUs ? 'rotate-90' : ''}`} />
                    </button>
                    {openDrawerAccordions.contactUs && (
                      <div className="portal-accordion-panel text-xs text-slate-400 space-y-2.5 py-1">
                        <p className="flex items-center gap-2">
                          <Truck size={14} className="text-[#00F631]" />
                          <span>Islandwide Rapid Delivery Outlets</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00F631]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 
                          <span>+94 11 234 5678</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail size={14} className="text-[#00F631]" />
                          <span>support@vmssupermart.com</span>
                        </p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Stay in Touch inside Menu Drawer */}
                <div className="portal-drawer-subscribe-box">
                  <div className="portal-subscribe-header">
                    <Mail size={20} className="text-[#00F631]" />
                    <h4>STAY IN TOUCH</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                  </p>
                  <form onSubmit={handleSubscribeMenu} className="portal-subscribe-form">
                    <input 
                      type="email" 
                      placeholder="your-email@example.com" 
                      value={menuEmail}
                      onChange={(e) => setMenuEmail(e.target.value)}
                      className="portal-subscribe-input"
                      required
                    />
                    <button type="submit" className="portal-subscribe-btn" aria-label="Subscribe">
                      <ArrowRight size={16} />
                    </button>
                  </form>
                </div>

                {/* Social links */}
                <div className="portal-drawer-socials">
                  <a href="#" className="portal-drawer-social-icon" aria-label="TikTok">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.86 1.09 2.05 1.86 3.4 2.27v4.13c-1.89-.22-3.65-1.04-4.88-2.47-.02 2.9-.01 5.8 0 8.7-.13 2.13-.97 4.22-2.44 5.75-1.63 1.77-4.04 2.76-6.44 2.66-2.58-.09-5.04-1.39-6.43-3.56-1.57-2.39-1.78-5.59-.57-8.15C2.1 11.23 4.22 9.54 6.78 9.17c.05 1.48.02 2.96.03 4.44-1.21.24-2.29.98-2.88 2.07-.63 1.08-.66 2.45-.07 3.56.59 1.15 1.82 1.93 3.12 1.99 1.25.07 2.52-.42 3.27-1.42.59-.75.83-1.72.78-2.68V0h1.49z"/></svg>
                  </a>
                  <a href="#" className="portal-drawer-social-icon" aria-label="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </a>
                  <a href="#" className="portal-drawer-social-icon" aria-label="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                  <a href="#" className="portal-drawer-social-icon" aria-label="YouTube">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                  </a>
                </div>

                {/* Currency selector inside drawer */}
                <div className="portal-drawer-currency">
                  <div className="portal-currency-trigger">
                    <span>SRI LANKA (LKR Rs)</span>
                    <ChevronDown size={14} />
                  </div>
                </div>

              </div>

              <div className="portal-drawer-footer">
                <p className="text-[10px] text-slate-500 font-bold text-center">
                  © VMS PORTAL 2026<br />POWERED BY VMS SOLUTIONS
                </p>
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

        {/* Horizontal Category Tab Selector */}
        <section className="portal-categories-section">
          <div className="portal-categories-swiper">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`portal-category-tab ${activeCategory === cat ? 'active' : ''}`}
              >
                <span>{cat.toUpperCase()}</span>
                {activeCategory === cat && <span className="portal-category-tab-line" />}
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

        {/* Completely Redesigned Stay-in-Touch Footer */}
        <footer className="portal-footer">
          <div className="portal-footer-divider"></div>
          
          {/* Newsletter Stay-in-Touch Section */}
          <div className="portal-footer-newsletter">
            <div className="portal-subscribe-header">
              <Mail size={22} className="text-[#00F631]" />
              <h4>STAY IN TOUCH</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form onSubmit={handleSubscribeFooter} className="portal-subscribe-form">
              <input 
                type="email" 
                placeholder="your-email@example.com" 
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                className="portal-subscribe-input"
                required
              />
              <button type="submit" className="portal-subscribe-btn" aria-label="Subscribe">
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Interactive Footer Accordion Sections */}
          <div className="portal-footer-accordions">
            
            {/* STORE OUTLETS */}
            <div className="portal-footer-accordion-item">
              <button 
                className="portal-footer-accordion-trigger"
                onClick={() => toggleFooterAccordion('storeOutlets')}
              >
                <span>STORE OUTLETS</span>
                <ChevronRight size={14} className={`portal-accordion-arrow ${openFooterAccordions.storeOutlets ? 'rotate-90' : ''}`} />
              </button>
              {openFooterAccordions.storeOutlets && (
                <div className="portal-footer-accordion-panel">
                  <p>Colombo Outlet</p>
                  <p>Kandy Branch</p>
                  <p>Galle Outlet</p>
                  <p>Negombo Branch</p>
                </div>
              )}
            </div>

            {/* CUSTOMER SUPPORT */}
            <div className="portal-footer-accordion-item">
              <button 
                className="portal-footer-accordion-trigger"
                onClick={() => toggleFooterAccordion('customerSupport')}
              >
                <span>CUSTOMER SUPPORT</span>
                <ChevronRight size={14} className={`portal-accordion-arrow ${openFooterAccordions.customerSupport ? 'rotate-90' : ''}`} />
              </button>
              {openFooterAccordions.customerSupport && (
                <div className="portal-footer-accordion-panel">
                  <p>Help Center</p>
                  <p>Delivery Policy</p>
                  <p>Terms of Service</p>
                </div>
              )}
            </div>

            {/* QUICK LINKS */}
            <div className="portal-footer-accordion-item">
              <button 
                className="portal-footer-accordion-trigger"
                onClick={() => toggleFooterAccordion('quickLinks')}
              >
                <span>QUICK LINKS</span>
                <ChevronRight size={14} className={`portal-accordion-arrow ${openFooterAccordions.quickLinks ? 'rotate-90' : ''}`} />
              </button>
              {openFooterAccordions.quickLinks && (
                <div className="portal-footer-accordion-panel">
                  <a href="/">Home Portal</a>
                  <a href="/all-products">Browse Catalog</a>
                  <a href="/my-orders">My Purchase History</a>
                  <a href="/profile">My Account Profile</a>
                </div>
              )}
            </div>

          </div>

          {/* Social Links */}
          <div className="portal-footer-socials">
            <a href="#" className="portal-footer-social-icon" aria-label="TikTok">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.86 1.09 2.05 1.86 3.4 2.27v4.13c-1.89-.22-3.65-1.04-4.88-2.47-.02 2.9-.01 5.8 0 8.7-.13 2.13-.97 4.22-2.44 5.75-1.63 1.77-4.04 2.76-6.44 2.66-2.58-.09-5.04-1.39-6.43-3.56-1.57-2.39-1.78-5.59-.57-8.15C2.1 11.23 4.22 9.54 6.78 9.17c.05 1.48.02 2.96.03 4.44-1.21.24-2.29.98-2.88 2.07-.63 1.08-.66 2.45-.07 3.56.59 1.15 1.82 1.93 3.12 1.99 1.25.07 2.52-.42 3.27-1.42.59-.75.83-1.72.78-2.68V0h1.49z"/></svg>
            </a>
            <a href="#" className="portal-footer-social-icon" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="portal-footer-social-icon" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" className="portal-footer-social-icon" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
          </div>

          {/* Currency Dropdown Selector */}
          <div className="portal-footer-currency">
            <div className="portal-currency-trigger">
              <span>SRI LANKA (LKR Rs)</span>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Copyright Section */}
          <div className="portal-footer-bottom">
            <p className="text-[10px] text-slate-500 font-bold text-center w-full">
              © VMS PORTAL 2026 / POWERED BY VMS SOLUTIONS
            </p>
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

        {/* Slide-Up Cart & Checkout Drawer Sheet (Modern Full Screen Experience) */}
        {isCartOpen && (
          <div className="portal-sheet-backdrop" onClick={() => setIsCartOpen(false)}>
            <div className="portal-sheet portal-sheet-fullscreen" onClick={(e) => e.stopPropagation()}>
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
              <div className="portal-cart-list flex-grow">
                {Object.keys(cart).length === 0 ? (
                  <div className="text-center py-20 text-slate-500">
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
                    className="portal-checkout-btn mb-4"
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
