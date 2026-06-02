import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import vmsLogo from '../assets/VMS logo.png'
import profileIcon from '../assets/man.png'
import { useAppContext } from '../context/AppContext'
import { Heart, ShoppingCart, Search, Menu, X } from 'lucide-react'

const Navbar = () => {
    const [open, setOpen] = React.useState(false)
    const [showUserLogin, setShowUserLogin] = React.useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const hideIcons = location && location.pathname === '/login'
    const { searchQuery, setSearchQuery, cartItems, wishlistItems = [], user, userLogout } = useAppContext()

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
        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-0 bg-slate-900 border-b border-slate-800 sticky top-0 z-50 h-16 md:h-20">

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
                    <div className="hidden lg:flex items-center text-sm gap-3 border border-slate-700 px-4 py-2 rounded-none hover:border-[#00FF33] transition-all bg-slate-800/50 group">
                        <Search size={16} className="text-slate-500 group-hover:text-[#00FF33] transition-colors" />
                        <input
                            className="py-1 w-48 xl:w-64 bg-transparent outline-none text-white placeholder-slate-500 font-bold"
                            type="text"
                            placeholder="Search in VMS Super Mart"
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
                                <div className="relative group">
                                    {/* Trigger Button */}
                                    <button
                                        className="cursor-pointer px-6 py-2 bg-[#00FF33] hover:bg-[#00CC29] transition-all text-slate-900 rounded-none font-black text-xs uppercase tracking-tighter flex items-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(0,255,51,0.2)] px-5"
                                    >
                                        Login
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-300"><path d="m6 9 6 6 6-6" /></svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute top-full right-0 mt-3 w-56 bg-slate-900 rounded-none shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                                        <div className="p-2 space-y-1">
                                            <Link
                                                to="/login"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 rounded-none transition-colors group/item"
                                            >
                                                <div className="w-8 h-8 rounded-none bg-slate-800 flex items-center justify-center text-[#00FF33] group-hover/item:bg-[#00FF33] group-hover/item:text-slate-900 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight text-white">Customer Login</p>
                                                    <p className="text-[10px] text-slate-500 font-bold tracking-tight">Active Session</p>
                                                </div>
                                            </Link>

                                            <div className="h-px bg-slate-800 mx-2 my-1"></div>

                                            <Link
                                                to="/admin/login"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 rounded-none transition-colors group/item"
                                            >
                                                <div className="w-8 h-8 rounded-none bg-slate-800 flex items-center justify-center text-slate-400 group-hover/item:bg-white group-hover/item:text-slate-900 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight text-white">Admin Portal</p>
                                                    <p className="text-[10px] text-slate-500 font-bold tracking-tight">Node Control</p>
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-t border-slate-800">
                                            <span className="text-[8px] text-slate-500 font-black tracking-[0.2em] uppercase">VMS Shield Enabled</span>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 bg-[#00FF33] rounded-full animate-pulse"></div>
                                                <div className="w-1 h-1 bg-[#00FF33] rounded-full animate-pulse delay-75"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 px-3 py-2 rounded-none transition border border-slate-800">
                                        <img src={profileIcon} className="w-8 h-8 rounded-none border border-slate-700" alt="Profile" />
                                        <span className="text-slate-300 font-black text-xs uppercase tracking-tight">{user.firstName} {user.lastName}</span>
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

            {/* Mobile Menu Button */}
            <button onClick={() => setOpen(!open)} aria-label="Menu" className="sm:hidden text-white p-2">
                {open ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Mobile Menu */}
            <div className={`${open ? 'flex' : 'hidden'} absolute top-full left-0 w-full bg-slate-900 shadow-2xl py-6 flex-col items-start gap-4 px-6 text-sm md:hidden z-50 border-t border-slate-800 animate-in slide-in-from-top-4 duration-300`}>
                <Link to="/" onClick={() => setOpen(false)} className="block text-slate-300 font-black uppercase tracking-widest hover:text-[#00FF33] transition-colors w-full py-2">Home</Link>
                <Link to="/all-products" onClick={() => setOpen(false)} className="block text-slate-300 font-black uppercase tracking-widest hover:text-[#00FF33] transition-colors w-full py-2">All Products</Link>
                <Link to="/contact" onClick={() => setOpen(false)} className="block text-slate-300 font-black uppercase tracking-widest hover:text-[#00FF33] transition-colors w-full py-2">Contact</Link>

                {/* Mobile Search */}
                {!hideIcons && (
                    <div className="flex items-center text-sm gap-3 border border-slate-700 px-4 py-3 rounded-none w-full mt-4 bg-slate-800/50">
                        <Search size={18} className="text-slate-500" />
                        <input
                            className="py-1 w-full bg-transparent outline-none text-white placeholder-slate-500 font-bold uppercase text-xs"
                            type="text"
                            placeholder="Search products"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                if (location.pathname !== '/all-products') {
                                    navigate('/all-products')
                                }
                                setOpen(false)
                            }}
                        />
                    </div>
                )}

                {/* Mobile Cart & Wishlist */}
                {!hideIcons && (
                    <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-slate-800">
                        <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 bg-slate-800 py-3 text-slate-300 font-black uppercase text-xs">
                            <Heart size={16} />
                            <span>Wishlist</span>
                        </Link>
                        <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 bg-slate-800 py-3 text-slate-300 font-black uppercase text-xs">
                            <ShoppingCart size={16} />
                            <span>Cart</span>
                        </Link>
                    </div>
                )}

                {!hideIcons && (
                    (!user ? (
                        <Link to="/login" onClick={() => setOpen(false)} className="cursor-pointer px-6 py-4 mt-2 bg-[#00FF33] hover:bg-[#00CC29] transition text-slate-900 rounded-none font-black uppercase text-center w-full tracking-[0.2em]">Login</Link>
                    ) : (
                        <div className="w-full mt-2 pt-4 border-t border-slate-800 space-y-3">
                            <div className="flex items-center gap-4 py-2">
                                <img src={profileIcon} className="w-10 h-10 rounded-none border border-slate-700" alt="Profile" />
                                <div>
                                    <p className="text-white font-black uppercase tracking-tight">{user.firstName} {user.lastName}</p>
                                    <p className="text-[10px] text-[#00FF33] font-bold">{user.email}</p>
                                </div>
                            </div>
                            <Link 
                                to="/my-orders" 
                                onClick={() => setOpen(false)}
                                className="block bg-slate-800 text-white font-black uppercase text-xs text-center py-3 w-full border border-slate-700 hover:border-[#00FF33] transition"
                            >
                                My Orders
                            </Link>
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    userLogout();
                                }}
                                className="block w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs text-center py-3 border-none cursor-pointer"
                            >
                                Log Out
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Login Modal */}
            {showUserLogin && (
                <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-slate-900 p-10 rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] w-96 border border-slate-800">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-6 border-l-4 border-[#00FF33] pl-6">Secure Access</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Identification</label>
                                <input
                                    type="email"
                                    placeholder="USER_ID@VMS.COM"
                                    className="w-full p-4 bg-slate-800 border border-slate-700 text-white font-bold rounded-none focus:outline-none focus:border-[#00FF33] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Authorization Key</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full p-4 bg-slate-800 border border-slate-700 text-white font-bold rounded-none focus:outline-none focus:border-[#00FF33] transition-all"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleLogin}
                                    className="flex-1 bg-[#00FF33] hover:bg-[#00CC29] text-slate-900 font-black uppercase py-4 rounded-none transition tracking-widest text-xs"
                                >
                                    Verify
                                </button>
                                <button
                                    onClick={() => setShowUserLogin(false)}
                                    className="flex-1 border border-slate-700 text-slate-400 font-black uppercase py-4 rounded-none hover:bg-slate-800 transition tracking-widest text-xs"
                                >
                                    Abort
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar