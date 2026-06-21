import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { cartItems, wishlistItems = [] } = useAppContext();

  // If inside admin or seller pages, do not display the bottom nav
  const isAdminPath = location.pathname.startsWith('/admin');
  const isSellerPath = location.pathname.includes('seller');
  const isDeliveryPath = location.pathname.startsWith('/delivery');
  if (isAdminPath || isSellerPath || isDeliveryPath) return null;

  // Calculate total cart items
  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        totalCount += cartItems[itemId];
      }
    }
    return totalCount;
  };

  const navItems = [
    {
      label: 'Home',
      icon: <Home size={20} />,
      path: '/'
    },
    {
      label: 'Shop',
      icon: <Search size={20} />,
      path: '/all-products'
    },
    {
      label: 'Cart',
      icon: <ShoppingCart size={20} />,
      path: '/cart',
      badge: getCartCount()
    },
    {
      label: 'Wishlist',
      icon: <Heart size={20} />,
      path: '/wishlist',
      badge: wishlistItems.length
    },
    {
      label: 'Profile',
      icon: <User size={20} />,
      path: '/profile'
    }
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 h-16 flex items-center justify-around z-40 px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-400 hover:text-white transition-all duration-300 relative ${
              isActive ? 'text-[#00FF33]' : 'text-slate-400'
            }`}
          >
            {/* Icon Wrapper with animation */}
            <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
              {item.icon}
            </div>

            {/* Label */}
            <span className="text-[10px] font-bold tracking-wider mt-1 uppercase">
              {item.label}
            </span>

            {/* Active Indicator Dot */}
            {isActive && (
              <span className="absolute bottom-1 w-1.5 h-1.5 bg-[#00FF33] rounded-full shadow-[0_0_10px_#00FF33] animate-pulse" />
            )}

            {/* Badge Notification */}
            {item.badge > 0 && (
              <span className="absolute top-1.5 right-1/2 translate-x-4 bg-[#00FF33] text-slate-950 font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
