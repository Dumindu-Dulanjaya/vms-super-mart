import React from 'react';
import logo from '../assets/VMS logo.png';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t-4 border-[#00FF33] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <img src={logo} alt="VMS Supermart" className="h-40 w-auto object-contain brightness-110" />
          </div>
          <p className="text-sm font-medium leading-relaxed text-slate-400">
            Pioneering industrial-grade security and smart automated solutions.
            VMS Super Mart is committed to providing 24/7 technical security support
            with a mission to protect your assets with tactical precision.
          </p>
        </div>

        {/* Tactical Links */}
        <div>
          <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <span className="w-4 h-1 bg-[#00FF33]"></span>
            Operations
          </h3>
          <ul className="text-sm space-y-4 font-bold">
            <li><Link to="/" className="hover:text-[#00FF33] transition-all flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-[#00FF33] transition-all"></span>Home Overview</Link></li>
            <li><Link to="/all-products" className="hover:text-[#00FF33] transition-all flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-[#00FF33] transition-all"></span>Product Depot</Link></li>
            <li><Link to="/all-products" className="hover:text-[#00FF33] transition-all flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-[#00FF33] transition-all"></span>Active Deals</Link></li>
            <li><Link to="/wishlist" className="hover:text-[#00FF33] transition-all flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-[#00FF33] transition-all"></span>Tactical Wishlist</Link></li>
          </ul>
        </div>

        {/* Support Vector */}
        <div>
          <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <span className="w-4 h-1 bg-[#00FF33]"></span>
            Support HQ
          </h3>
          <ul className="text-sm space-y-4 font-bold">
            <li><Link to="/contact" className="hover:text-[#00FF33] transition-all">Direct Contact</Link></li>
            <li><Link to="#" className="hover:text-[#00FF33] transition-all">Shipping Information</Link></li>
            <li><Link to="#" className="hover:text-[#00FF33] transition-all">Refund Protocols</Link></li>
            <li><Link to="#" className="hover:text-[#00FF33] transition-all">Technical FAQs</Link></li>
          </ul>
        </div>

        {/* Communication Node */}
        <div>
          <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <span className="w-4 h-1 bg-[#00FF33]"></span>
            Coordinates
          </h3>
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 border-l-2 border-slate-700 hover:border-[#00FF33] transition-colors">
              <div className="flex items-center gap-3 text-white mb-1">
                <MapPin size={16} className="text-[#00FF33]" />
                <span className="text-xs font-black uppercase tracking-wider">HQ Location</span>
              </div>
              <p className="text-xs text-slate-400 font-medium ml-7">Malapalla, Pannipitiya, LK</p>
            </div>

            <div className="bg-slate-800/50 p-4 border-l-2 border-slate-700 hover:border-[#00FF33] transition-colors">
              <div className="flex items-center gap-3 text-white mb-1">
                <Phone size={16} className="text-[#00FF33]" />
                <span className="text-xs font-black uppercase tracking-wider">Comms Link</span>
              </div>
              <p className="text-xs text-slate-400 font-medium ml-7">0766540131</p>
            </div>

            <div className="flex gap-4 pt-4">
              {[
                { icon: <Facebook size={18} />, href: "#" },
                { icon: <Twitter size={18} />, href: "#" },
                { icon: <Instagram size={18} />, href: "#" },
                { icon: <Youtube size={18} />, href: "#" }
              ].map((social, i) => (
                <a key={i} href={social.href} className="w-10 h-10 bg-slate-800 flex items-center justify-center hover:bg-[#00FF33] hover:text-slate-900 transition-all rounded-none border border-slate-700">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Final Copyright Bar */}
      <div className="w-full border-t border-slate-800 bg-slate-950 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
          <span className="text-slate-500">
            System ID: <span className="text-slate-300">VMS-2025-CORE</span>
          </span>
          <span className="text-slate-500 text-center md:text-left">
            Copyright © 2025 VMS Supermart. All Right Reserved.
          </span>
          <div className="flex gap-6 text-slate-500">
            <Link to="#" className="hover:text-[#00FF33] transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-[#00FF33] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
