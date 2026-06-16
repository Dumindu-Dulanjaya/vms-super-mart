import React from 'react';
import logo from '../assets/VMS logo.png';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    toast.success("Subscribed successfully!");
  };

  return (
    <footer className="w-full bg-[#0F172B] text-slate-300 border-t border-[#1E293B] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col gap-12">
        
        {/* Top footer row: Brand and Stay in Touch Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12 border-b border-[#1E293B]">
          <div className="space-y-4">
            <div className="flex items-center">
              <img src={logo} alt="VMS Super Mart" className="h-16 w-auto object-contain brightness-110" />
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-400 max-w-md">
              Premium fresh groceries, dairy, beverages, and daily essentials delivered directly to your doorstep. Experience modern digital shopping.
            </p>
          </div>

          {/* Stay in Touch Newsletter */}
          <div className="bg-[#131B2E] p-6 border border-[#1E293B] space-y-4 rounded-none max-w-lg lg:ml-auto w-full">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-[#00F631]" />
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">STAY IN TOUCH</h3>
            </div>
            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form onSubmit={handleSubscribe} className="flex border border-slate-700 bg-slate-900/50">
              <input 
                type="email" 
                placeholder="your-email@example.com" 
                className="py-3 px-4 bg-transparent outline-none text-white text-sm w-full border-none animate-none"
                required
              />
              <button type="submit" className="bg-[#00F631] hover:bg-[#00D629] text-slate-950 px-6 cursor-pointer font-bold border-none transition-colors">
                →
              </button>
            </form>
          </div>
        </div>

        {/* Middle row: Store Outlets, Customer Support, Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Store Outlets */}
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-3.5 h-0.5 bg-[#00F631]"></span>
              Store Outlets
            </h3>
            <ul className="text-sm space-y-3 font-bold text-slate-400">
              <li>Colombo Outlet</li>
              <li>Kandy Branch</li>
              <li>Galle Outlet</li>
              <li>Negombo Branch</li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-3.5 h-0.5 bg-[#00F631]"></span>
              Customer Support
            </h3>
            <ul className="text-sm space-y-3 font-bold">
              <li><Link to="/contact" className="hover:text-[#00F631] text-slate-400 transition-colors">Direct Contact</Link></li>
              <li><Link to="#" className="hover:text-[#00F631] text-slate-400 transition-colors">Shipping Information</Link></li>
              <li><Link to="#" className="hover:text-[#00F631] text-slate-400 transition-colors">Refund Protocols</Link></li>
              <li><Link to="#" className="hover:text-[#00F631] text-slate-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-3.5 h-0.5 bg-[#00F631]"></span>
              Quick Links
            </h3>
            <ul className="text-sm space-y-3 font-bold">
              <li><Link to="/" className="hover:text-[#00F631] text-slate-400 transition-colors">Home Page</Link></li>
              <li><Link to="/all-products" className="hover:text-[#00F631] text-slate-400 transition-colors">All Products</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#00F631] text-slate-400 transition-colors">Wishlist</Link></li>
              <li><Link to="/my-orders" className="hover:text-[#00F631] text-slate-400 transition-colors">My Orders</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom row: Socials and Copyright */}
        <div className="pt-8 border-t border-[#1E293B] flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Social Icons */}
          <div className="flex gap-4">
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

          {/* Copyright Note */}
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center md:text-right">
            © 2026 VMS Super Mart
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
