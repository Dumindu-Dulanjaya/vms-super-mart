import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full flex flex-col items-center bg-white border-t border-gray-200 mt-12">
      <div className="w-full max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div className="flex flex-col items-start">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2 text-indigo-600">⚡</span>
            <span className="font-bold text-lg text-gray-800">brand</span>
          </div>
          <p className="text-gray-500 text-sm">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rerum unde quaerat eveniet cumque accusamus atque qui error quo enim fugiat?
          </p>
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
        <span className="text-gray-400 text-xs text-center">Copyright 2025 © PrebuiltUI All Right Reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;