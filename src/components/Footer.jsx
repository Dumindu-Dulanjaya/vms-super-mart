import React from 'react';
import logo from '../assets/VMS logo.png';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    toast.success("Subscribed successfully!");
  };

  return (
    <footer 
      className="w-full bg-[#0F172B] text-slate-300 border-t border-[#1E293B] mt-20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #090d16 0%, #0f172b 40%, #05140b 75%, #0f172b 100%)',
        backgroundSize: '400% 400%',
        animation: 'footerGradientShift 25s ease infinite'
      }}
    >
      {/* Inline Keyframe Animations */}
      <style>{`
        @keyframes footerGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes footerGridMove {
          0% { background-position: 0px 0px; }
          100% { background-position: 24px 24px; }
        }
        @keyframes footerFloat1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes footerFloat2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes footerFloat3 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-25px, -30px) scale(0.95); }
          66% { transform: translate(30px, 40px) scale(1.05); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>

      {/* Animated Dot Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.06] z-0" 
        style={{
          backgroundImage: 'radial-gradient(#00F631 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          animation: 'footerGridMove 40s linear infinite'
        }} 
      />

      {/* Floating Blurred Glow Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute w-[350px] h-[350px] rounded-full bg-[#00F631]/8 blur-[90px] -top-20 -left-20" 
          style={{ animation: 'footerFloat1 25s ease-in-out infinite' }} 
        />
        <div 
          className="absolute w-[300px] h-[300px] rounded-full bg-[#005c12]/12 blur-[80px] bottom-10 right-10" 
          style={{ animation: 'footerFloat2 32s ease-in-out infinite' }} 
        />
        <div 
          className="absolute w-[280px] h-[280px] rounded-full bg-[#00F631]/5 blur-[100px] top-1/3 left-1/3" 
          style={{ animation: 'footerFloat3 28s ease-in-out infinite' }} 
        />
        <div 
          className="absolute w-[200px] h-[200px] rounded-full bg-[#00F631]/4 blur-[70px] -top-10 right-1/4" 
          style={{ animation: 'footerFloat1 35s ease-in-out infinite' }} 
        />
      </div>
      
      {/* Top section: Brand and Stay in Touch (Dark background) */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex items-center">
              <img src={logo} alt="VMS Super Mart" className="h-16 w-auto object-contain brightness-110" />
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-400 max-w-md">
              Premium fresh groceries, dairy, beverages, and daily essentials delivered directly to your doorstep. Experience modern digital shopping.
            </p>
          </div>

          {/* Stay in Touch Newsletter */}
          <div className="bg-[#131B2E]/90 backdrop-blur-sm p-6 border border-[#1E293B] space-y-4 rounded-none max-w-lg lg:ml-auto w-full">
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
      </div>

      {/* Middle section: Store Outlets, Customer Support, Quick Links (White background with glass opacity) */}
      <div className="w-full bg-white/92 backdrop-blur-md border-t border-b border-slate-200/50 z-10 relative">
        <motion.div 
          className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          {/* Store Outlets */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
          >
            <h3 className="text-slate-800 text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-3.5 h-0.5 bg-[#00F631]"></span>
              Store Outlets
            </h3>
            <ul className="text-sm space-y-3 font-bold text-slate-600">
              <li>Colombo Outlet</li>
              <li>Kandy Branch</li>
              <li>Galle Outlet</li>
              <li>Negombo Branch</li>
            </ul>
          </motion.div>

          {/* Customer Support */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
          >
            <h3 className="text-slate-800 text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-3.5 h-0.5 bg-[#00F631]"></span>
              Customer Support
            </h3>
            <ul className="text-sm space-y-3 font-bold">
              <li>
                <Link to="/contact" className="inline-block transition-all duration-300 hover:text-[#00F631] hover:translate-x-1 text-slate-600">
                  Direct Contact
                </Link>
              </li>
              <li>
                <Link to="#" className="inline-block transition-all duration-300 hover:text-[#00F631] hover:translate-x-1 text-slate-600">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="#" className="inline-block transition-all duration-300 hover:text-[#00F631] hover:translate-x-1 text-slate-600">
                  Refund Protocols
                </Link>
              </li>
              <li>
                <Link to="#" className="inline-block transition-all duration-300 hover:text-[#00F631] hover:translate-x-1 text-slate-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
          >
            <h3 className="text-slate-800 text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-3.5 h-0.5 bg-[#00F631]"></span>
              Quick Links
            </h3>
            <ul className="text-sm space-y-3 font-bold">
              <li>
                <Link to="/" className="inline-block transition-all duration-300 hover:text-[#00F631] hover:translate-x-1 text-slate-600">
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/all-products" className="inline-block transition-all duration-300 hover:text-[#00F631] hover:translate-x-1 text-slate-600">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="inline-block transition-all duration-300 hover:text-[#00F631] hover:translate-x-1 text-slate-600">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="inline-block transition-all duration-300 hover:text-[#00F631] hover:translate-x-1 text-slate-600">
                  My Orders
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom section: Socials and Copyright (Dark background) */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
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

    </footer>
  );
};

export default Footer;
