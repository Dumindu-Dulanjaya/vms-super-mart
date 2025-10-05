import React from 'react';
import logo from '../assets/VMS logo.png';

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
          <h3 className="font-semibold mb-2 text-gray-900">Quick Links</h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">Best Sellers</a></li>
            <li><a href="#" className="hover:underline">Offers & Deals</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">FAQs</a></li>
          </ul>
        </div>

        {/* Need Help? */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-900">Need Help?</h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li><a href="#" className="hover:underline">Delivery Information</a></li>
            <li><a href="#" className="hover:underline">Return & Refund Policy</a></li>
            <li><a href="#" className="hover:underline">Payment Methods</a></li>
            <li><a href="#" className="hover:underline">Track your Order</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-900">Follow Us</h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li><a href="#" className="hover:underline">Instagram</a></li>
            <li><a href="#" className="hover:underline">Twitter</a></li>
            <li><a href="#" className="hover:underline">Facebook</a></li>
            <li><a href="#" className="hover:underline">YouTube</a></li>
          </ul>
        </div>
      </div>

      <div className="w-full border-t border-gray-100 py-4 flex justify-center">
        <span className="text-gray-400 text-xs text-center">Copyright 2025 © VMS Supermart All Right Reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
