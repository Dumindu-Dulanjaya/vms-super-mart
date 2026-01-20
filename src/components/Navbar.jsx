import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import vmsLogo from '../assets/VMS logo.png'
import profileIcon from '../assets/man.png'
import { useAppContext } from '../context/AppContext'
import { Heart, ShoppingCart, Search, Menu, X } from 'lucide-react'

const Navbar = () => {
    const [open, setOpen] = React.useState(false)
    const [showUserLogin, setShowUserLogin] = React.useState(false)
    const [user, setUser] = React.useState(null)
    const location = useLocation()
    const navigate = useNavigate()
    const hideIcons = location && location.pathname === '/login'
    const { searchQuery, setSearchQuery, cartItems, wishlistItems = [] } = useAppContext()

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

    const handleLogin = () => {
        setUser({ name: "John Doe", email: "john@example.com" })
        setShowUserLogin(false)
    }

    return (
        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative">

            {/* VMS Logo */}
            <div onClick={handleLogoClick} className="cursor-pointer">
                <img
                    src={vmsLogo}
                    alt="VMS Logo"
                    className="h-30 w-auto object-contain hover:scale-105 transition-transform duration-200"
                />
            </div>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
                <Link to="/" className="hover:text-[#00FF33] transition-colors">Home</Link>
                <Link to="/contact" className="hover:text-[#00FF33] transition-colors">Contact</Link>
                <Link to="/all-products" className="hover:text-[#00FF33] transition-colors">All Products</Link>

                {!hideIcons && (
                    <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-4 py-2 rounded-full hover:border-[#00FF33] transition-colors bg-gray-50">
                        <Search size={18} className="text-gray-400" />
                        <input
                            className="py-1 w-64 bg-transparent outline-none placeholder-gray-500"
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

                {/* Wishlist Icon */}
                {!hideIcons && (
                    <Link to="/wishlist" className="relative cursor-pointer hover:scale-110 transition-transform">
                        <Heart size={24} className="text-gray-700 hover:text-[#00FF33] transition-colors" />
                        {wishlistItems.length > 0 && (
                            <span className="absolute -top-2 -right-2 text-xs text-white bg-red-500 w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                                {wishlistItems.length}
                            </span>
                        )}
                    </Link>
                )}

                {/* Cart Icon */}
                {!hideIcons && (
                    <Link to="/cart" className="relative cursor-pointer hover:scale-110 transition-transform">
                        <ShoppingCart size={24} className="text-gray-700 hover:text-[#00FF33] transition-colors" />
                        {getCartCount() > 0 && (
                            <span className="absolute -top-2 -right-2 text-xs text-white bg-[#00FF33] w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                                {getCartCount()}
                            </span>
                        )}
                    </Link>
                )}

                {/* Login Section */}
                {!hideIcons && (
                    <div className="relative">
                        {!user ? (
                            <Link to="/login" className="cursor-pointer px-6 py-2 bg-[#00FF33] hover:bg-[#00CC29] transition text-white rounded-full font-medium">Login</Link>
                        ) : (
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition">
                                <img src={profileIcon} className="w-8 h-8 rounded-full border-2 border-gray-200" alt="Profile" />
                                <span className="text-gray-700 font-medium">{user.name}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setOpen(!open)} aria-label="Menu" className="sm:hidden">
                {open ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
            </button>

            {/* Mobile Menu */}
            <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-3 px-5 text-sm md:hidden z-50 border-t border-gray-200`}>
                <Link to="/" onClick={() => setOpen(false)} className="block hover:text-[#00FF33] transition-colors w-full py-2">Home</Link>
                <Link to="/all-products" onClick={() => setOpen(false)} className="block hover:text-[#00FF33] transition-colors w-full py-2">All Products</Link>
                <Link to="/contact" onClick={() => setOpen(false)} className="block hover:text-[#00FF33] transition-colors w-full py-2">Contact</Link>

                {/* Mobile Search */}
                {!hideIcons && (
                    <div className="flex items-center text-sm gap-2 border border-gray-300 px-3 py-2 rounded-full w-full mt-2">
                        <Search size={16} className="text-gray-400" />
                        <input
                            className="py-1 w-full bg-transparent outline-none placeholder-gray-500 text-sm"
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
                    <div className="flex gap-4 w-full py-2">
                        <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2 hover:text-[#00FF33]">
                            <Heart size={20} />
                            <span>Wishlist ({wishlistItems.length})</span>
                        </Link>
                        <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2 hover:text-[#00FF33]">
                            <ShoppingCart size={20} />
                            <span>Cart ({getCartCount()})</span>
                        </Link>
                    </div>
                )}

                {!hideIcons && (
                    (!user ? (
                        <Link to="/login" onClick={() => setOpen(false)} className="cursor-pointer px-6 py-2 mt-2 bg-[#00FF33] hover:bg-[#00CC29] transition text-white rounded-full text-sm w-full text-center">Login</Link>
                    ) : (
                        <div className="flex items-center gap-3 mt-2 py-2">
                            <img src={profileIcon} className="w-8 h-8 rounded-full border-2 border-gray-200" alt="Profile" />
                            <span className="text-gray-700 font-medium">{user.name}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Login Modal */}
            {showUserLogin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl font-bold mb-4">Login</h2>
                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={handleLogin}
                                    className="flex-1 bg-[#00FF33] hover:bg-[#00CC29] text-white py-3 rounded-lg transition"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setShowUserLogin(false)}
                                    className="flex-1 border border-gray-300 hover:bg-gray-100 py-3 rounded-lg transition"
                                >
                                    Cancel
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