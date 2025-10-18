import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import vmsLogo from '../assets/VMS logo.png'
import profileIcon from '../assets/man.png'

const Navbar = () => {
    const [open, setOpen] = React.useState(false)
    const [showUserLogin, setShowUserLogin] = React.useState(false)
    const [user, setUser] = React.useState(null)
    const location = useLocation()
    const hideIcons = location && location.pathname === '/login'
    
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
                {/* All Product intentionally removed */}
                <Link to="/contact" className="hover:text-[#00FF33] transition-colors">Contact</Link>
                <Link to="/All Products" className="hover:text-[#00FF33] transition-colors">All Products</Link>

                            {!hideIcons && (
                                <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
                                    <input className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.836 10.615 15 14.695" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="#7A7B7D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}

                {!hideIcons && (
                  <div className="relative cursor-pointer">
                      <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke="#00FF33" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <button className="absolute -top-2 -right-3 text-xs text-white bg-[#00FF33] w-[18px] h-[18px] rounded-full">3</button>
                  </div>
                )}

                {/* Login Section */}
                {!hideIcons && (
                  <div className="relative">
                      {!user ? (
                          <Link to="/login" className="cursor-pointer px-6 py-2 bg-[#00FF33] hover:bg-[#00CC29] transition text-white rounded-full">Login</Link>
                      ) : (
                          <div className="flex items-center gap-2">
                              <img src={profileIcon} className="w-8 h-8 rounded-full" alt="Profile" />
                              <span className="text-gray-700">{user.name}</span>
                          </div>
                      )}
                  </div>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setOpen(!open)} aria-label="Menu" className="sm:hidden">
                <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="21" height="1.5" rx=".75" fill="#426287" />
                    <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
                    <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
                </svg>
            </button>

            {/* Mobile Menu */}
            <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}>
                <Link to="/" className="block hover:text-[#00FF33] transition-colors">Home</Link>
                {/* All Product removed */}
                <Link to="/contact" className="block hover:text-[#00FF33] transition-colors">Contact</Link>
                
                {!hideIcons && (
                  (!user ? (
                      <Link to="/login" className="cursor-pointer px-6 py-2 mt-2 bg-[#00FF33] hover:bg-[#00CC29] transition text-white rounded-full text-sm">Login</Link>
                  ) : (
                      <div className="flex items-center gap-3 mt-2">
                          <img src={profileIcon} className="w-6 h-6 rounded-full" alt="Profile" />
                          <span className="text-gray-700">{user.name}</span>
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