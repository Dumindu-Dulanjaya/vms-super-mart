import React from 'react';
import logo from '../assets/VMS logo.png';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full flex flex-col items-center bg-white border-t border-gray-200 mt-12">
      <div className="w-full max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div className="flex flex-col items-start md:col-start-1 md:self-start md:justify-self-start md:-mt-8">
          <div className="flex items-center mb-2">
            <img src={logo} alt="VMS Supermart" className="h-28 md:h-36 lg:h-44 w-auto" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-900 uppercase text-xs tracking-widest">Quick Links</h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li><Link to="/" className="hover:text-[#00FF33] transition-colors">Home</Link></li>
            <li><Link to="/all-products" className="hover:text-[#00FF33] transition-colors">Best Sellers</Link></li>
            <li><Link to="/all-products" className="hover:text-[#00FF33] transition-colors">Offers & Deals</Link></li>
            <li><Link to="/contact" className="hover:text-[#00FF33] transition-colors">Contact Us</Link></li>
            <li><Link to="#" className="hover:text-[#00FF33] transition-colors">FAQs</Link></li>
          </ul>
        </div>

        {/* Need Help? */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-900 uppercase text-xs tracking-widest">Need Help?</h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li><Link to="#" className="hover:text-[#00FF33] transition-colors">Delivery Information</Link></li>
            <li><Link to="#" className="hover:text-[#00FF33] transition-colors">Return & Refund Policy</Link></li>
            <li><Link to="#" className="hover:text-[#00FF33] transition-colors">Payment Methods</Link></li>
            <li><Link to="#" className="hover:text-[#00FF33] transition-colors">Track your Order</Link></li>
            <li><Link to="/contact" className="hover:text-[#00FF33] transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-900 uppercase text-xs tracking-widest">Follow Us</h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li><Link to="#" className="hover:text-[#00FF33] transition-colors">Instagram</Link></li>
            <li><Link to="#" className="hover:text-[#00FF33] transition-colors">Twitter</Link></li>
            <li><Link to="#" className="hover:text-[#00FF33] transition-colors">Facebook</Link></li>
            <li><Link to="#" className="hover:text-[#00FF33] transition-colors">YouTube</Link></li>
          </ul>
        </div>
      </div>

      <div className="w-full border-t border-gray-100 py-6 flex justify-center">
        <span className="text-gray-400 text-[10px] text-center font-bold tracking-widest uppercase">Copyright 2025 © VMS Supermart All Right Reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
