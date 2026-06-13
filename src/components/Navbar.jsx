import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import vmsLogo from '../assets/VMS logo.png'
import profileIcon from '../assets/man.png'
import { useAppContext } from '../context/AppContext'
import { Heart, ShoppingCart, Search, Menu, X, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const Navbar = () => {
    const [open, setOpen] = React.useState(false)
    const [showUserLogin, setShowUserLogin] = React.useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const hideIcons = location && location.pathname === '/login'
    const { searchQuery, setSearchQuery, cartItems, wishlistItems = [], user, userLogout, products = [], currency } = useAppContext()
    const [suggestions, setSuggestions] = React.useState([])
    const [showSuggestions, setShowSuggestions] = React.useState(false)

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length > 1) {
            const matches = products.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setShowSuggestions(false);
            if (location.pathname !== '/all-products') {
                navigate('/all-products');
            }
        }
    };

    // Calculate total cart items
    const getCartCount = () => {
        let totalCount = 0;
        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                totalCount += cartItems[itemId];
            }
        }
        return totalCount;
    }

    const handleLogoClick = () => {
        window.location.href = '/'
    }

    return (
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 h-16 md:h-20 flex items-center">

            {/* Mobile Header (visible only on mobile) */}
            <div className="flex sm:hidden w-full items-center justify-between h-full px-6">
                {/* Left: Hamburger */}
                <button onClick={() => setOpen(true)} aria-label="Toggle Menu" className="text-white hover:text-[#00F631] transition-colors p-1 bg-transparent border-none cursor-pointer">
                    <Menu size={24} />
                </button>

                {/* Center: Logo */}
                <div onClick={handleLogoClick} className="cursor-pointer flex items-center h-full">
                    <img
                        src={vmsLogo}
                        alt="VMS Logo"
                        className="h-20 w-auto object-contain brightness-110"
                    />
                </div>

                {/* Right: Cart */}
                <Link to="/cart" className="relative p-1 text-white hover:text-[#00F631] transition-colors">
                    <ShoppingCart size={24} />
                    {getCartCount() > 0 && (
                        <span className="absolute -top-1 -right-1 text-[9px] text-slate-950 bg-[#00F631] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black">
                            {getCartCount()}
                        </span>
                    )}
                </Link>
            </div>

            {/* Desktop Header (hidden on mobile) */}
            <div className="hidden sm:flex w-full items-center justify-between h-full px-6 md:px-16 lg:px-24 xl:px-32">
                {/* VMS Logo */}
                <div onClick={handleLogoClick} className="cursor-pointer shrink-0 flex items-center h-full overflow-visible">
                    <img
                        src={vmsLogo}
                        alt="VMS Logo"
                        className="h-24 md:h-28 w-auto object-contain hover:scale-105 transition-all duration-300 relative z-20"
                    />
                </div>

                {/* Desktop Menu */}
                <div className="hidden sm:flex items-center gap-10">
                    <div className="flex items-center gap-8 text-[13px] font-bold uppercase tracking-widest text-slate-300">
                        <Link to="/" className="hover:text-[#00FF33] transition-colors border-b-2 border-transparent hover:border-[#00FF33] pb-1">Home</Link>
                        <Link to="/contact" className="hover:text-[#00FF33] transition-colors border-b-2 border-transparent hover:border-[#00FF33] pb-1">Contact</Link>
                        <Link to="/all-products" className="hover:text-[#00FF33] transition-colors border-b-2 border-transparent hover:border-[#00FF33] pb-1">All Products</Link>
                    </div>

                    {!hideIcons && (
                        <div className="hidden lg:flex items-center text-sm gap-3 border border-slate-700 px-4 py-2 rounded-none hover:border-[#00FF33] transition-all bg-slate-800/50 group relative">
                            <Search size={16} className="text-slate-500 group-hover:text-[#00FF33] transition-colors cursor-pointer" onClick={() => {
                                if (location.pathname !== '/all-products') navigate('/all-products');
                            }} />
                            <input
                                className="py-1 w-48 xl:w-64 bg-transparent outline-none text-white placeholder-slate-500 font-bold"
                                type="text"
                                placeholder="Search in VMS Super Mart"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => {
                                    if (searchQuery.trim().length > 1) {
                                        setShowSuggestions(true);
                                    }
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                            />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-800 mt-2 shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-50 overflow-hidden divide-y divide-slate-800/60 animate-fadeIn">
                                    {suggestions.map((p) => (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                setShowSuggestions(false);
                                                navigate(`/product/${p.slug}`);
                                            }}
                                            className="flex items-center justify-between gap-3 p-3 hover:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 bg-slate-800 rounded-none overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-700">
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="min-w-0 text-left">
                                                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-0.5">{p.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-black text-[#00FF33]">{currency}{p.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-6">
                        {/* Wishlist Icon */}
                        {!hideIcons && (
                            <Link to="/wishlist" className="relative cursor-pointer hover:translate-y-[-2px] transition-transform group">
                                <Heart size={20} className="text-slate-300 group-hover:text-[#00FF33] transition-colors" />
                                {wishlistItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 text-[10px] text-slate-900 bg-[#00FF33] w-4 h-4 rounded-none flex items-center justify-center font-black">
                                        {wishlistItems.length}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Cart Icon */}
                        {!hideIcons && (
                            <Link to="/cart" className="relative cursor-pointer hover:translate-y-[-2px] transition-transform group">
                                <ShoppingCart size={20} className="text-slate-300 group-hover:text-[#00FF33] transition-colors" />
                                {getCartCount() > 0 && (
                                    <span className="absolute -top-2 -right-2 text-[10px] text-slate-900 bg-[#00FF33] w-4 h-4 rounded-none flex items-center justify-center font-black">
                                        {getCartCount()}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Login Section */}
                        {!hideIcons && (
                            <div className="flex items-center">
                                {!user ? (
                                    <Link
                                        to="/login"
                                        className="cursor-pointer px-6 py-2 bg-[#00FF33] hover:bg-[#00CC29] transition-all text-slate-900 rounded-none font-black text-xs uppercase tracking-tighter flex items-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(0,255,51,0.2)]"
                                    >
                                        Login
                                    </Link>
                                ) : (
                                    <div className="relative group">
                                        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 px-3 py-2 rounded-none transition border border-slate-800">
                                            <img src={profileIcon} className="w-8 h-8 rounded-none border border-slate-700" alt="Profile" />
                                            <span className="text-slate-300 font-black text-xs uppercase tracking-tight">User: {user.firstName} {user.lastName}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-300 text-slate-400"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                        <div className="absolute top-full right-0 mt-3 w-56 bg-slate-900 rounded-none shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                                            <div className="p-4 border-b border-slate-800 bg-slate-950">
                                                <p className="text-xs font-black uppercase text-[#00FF33] tracking-wider mb-0.5">Welcome,</p>
                                                <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                                                <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 rounded-none transition-colors group/item"
                                                >
                                                    <div className="w-8 h-8 rounded-none bg-slate-800 flex items-center justify-center text-[#00FF33] group-hover/item:bg-[#00FF33] group-hover/item:text-slate-900 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-tight text-white">My Profile</p>
                                                        <p className="text-[10px] text-slate-500 font-bold tracking-tight">Account & Addresses</p>
                                                    </div>
                                                </Link>
                                                <Link
                                                    to="/my-orders"
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 rounded-none transition-colors group/item"
                                                >
                                                    <div className="w-8 h-8 rounded-none bg-slate-800 flex items-center justify-center text-[#00FF33] group-hover/item:bg-[#00FF33] group-hover/item:text-slate-900 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-tight text-white">My Orders</p>
                                                        <p className="text-[10px] text-slate-500 font-bold tracking-tight">Order History</p>
                                                    </div>
                                                </Link>
                                                <button
                                                    onClick={userLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-950/40 text-red-400 rounded-none transition-colors group/item text-left border-none bg-transparent cursor-pointer"
                                                >
                                                    <div className="w-8 h-8 rounded-none bg-slate-800 flex items-center justify-center text-red-400 group-hover/item:bg-red-500 group-hover/item:text-white transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-tight">Sign Out</p>
                                                        <p className="text-[10px] text-slate-500 font-bold tracking-tight">End Session</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Full-Screen Menu Drawer Overlay */}
            {open && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex justify-start sm:hidden animate-fadeIn" onClick={() => setOpen(false)}>
                    <div 
                        className="w-full max-w-[320px] h-full bg-slate-900 border-r border-slate-800 flex flex-col p-6 overflow-y-auto space-y-6 animate-slideInLeft shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div onClick={() => { setOpen(false); handleLogoClick(); }} className="cursor-pointer flex items-center">
                                <img
                                    src={vmsLogo}
                                    alt="VMS Logo"
                                    className="h-16 w-auto object-contain brightness-110"
                                />
                            </div>
                            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-[#00FF33] transition-colors p-2 bg-transparent border-none cursor-pointer">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search Field inside menu */}
                        {!hideIcons && (
                            <div className="flex items-center gap-3 border border-slate-700 px-4 py-3 bg-slate-800/50 rounded-none">
                                <Search size={18} className="text-slate-500" />
                                <input
                                    className="py-1 w-full bg-transparent outline-none text-white placeholder-slate-500 font-bold uppercase text-xs border-none"
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        if (location.pathname !== '/all-products') {
                                            navigate('/all-products')
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="flex flex-col space-y-2 text-sm font-black uppercase tracking-[0.2em] text-slate-300">
                            <Link to="/" onClick={() => setOpen(false)} className="hover:text-[#00FF33] transition-colors py-3 border-b border-slate-800/60 block">Home</Link>
                            <Link to="/all-products" onClick={() => setOpen(false)} className="hover:text-[#00FF33] transition-colors py-3 border-b border-slate-800/60 block">All Products</Link>
                            <Link to="/cart" onClick={() => setOpen(false)} className="hover:text-[#00FF33] transition-colors py-3 border-b border-slate-800/60 block">Cart</Link>
                            <Link to="/wishlist" onClick={() => setOpen(false)} className="hover:text-[#00FF33] transition-colors py-3 border-b border-slate-800/60 block">Wishlist</Link>
                            <Link to="/my-orders" onClick={() => setOpen(false)} className="hover:text-[#00FF33] transition-colors py-3 border-b border-slate-800/60 block">My Orders</Link>
                            <Link to="/contact" onClick={() => setOpen(false)} className="hover:text-[#00FF33] transition-colors py-3 border-b border-slate-800/60 block">Contact Us</Link>
                        </div>

                        {/* Stay in touch newsletter */}
                        <div className="bg-slate-800/40 p-5 border border-slate-800 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-white flex items-center gap-2">
                                <span className="w-3.5 h-0.5 bg-[#00F631]"></span>
                                STAY IN TOUCH
                            </h4>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                                Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                            </p>
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    toast.success("Subscribed successfully!");
                                }} 
                                className="flex border border-slate-700 bg-slate-900/50"
                            >
                                <input 
                                    type="email" 
                                    placeholder="your-email@example.com" 
                                    className="py-2.5 px-3 bg-transparent outline-none text-white text-xs w-full border-none"
                                    required
                                />
                                <button type="submit" className="bg-[#00F631] hover:bg-[#00D629] text-slate-950 px-4 cursor-pointer font-bold border-none transition-colors">
                                    →
                                </button>
                            </form>
                        </div>

                        {/* Social Media icons */}
                        <div className="flex gap-4 justify-center pt-2">
                            {[
                                { icon: <Facebook size={18} />, href: "#" },
                                { icon: <Twitter size={18} />, href: "#" },
                                { icon: <Instagram size={18} />, href: "#" },
                                { icon: <Youtube size={18} />, href: "#" }
                            ].map((social, i) => (
                                <a key={i} href={social.href} className="w-10 h-10 bg-slate-800 flex items-center justify-center hover:bg-[#00F631] hover:text-slate-900 transition-all rounded-none border border-slate-700 text-slate-300">
                                    {social.icon}
                                </a>
                            ))}
                        </div>

                        {/* Currency Selector */}
                        <div className="pt-2 flex justify-center">
                            <div className="inline-flex items-center gap-2 bg-slate-800 border border-[#00F631] px-4 py-2 text-[#00F631] text-[10px] font-black uppercase tracking-wider">
                                <span>Sri Lanka (LKR Rs)</span>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-bold tracking-wider text-center">
                            © 2026 VMS Super Mart
                        </div>
                    </div>
                </div>
            )}

        </nav>
    );
}

export default Navbar