import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  ShoppingCart,
  BarChart3
} from 'lucide-react';
import Dashboard from './Dashboard';
import AddProduct from './AddProduct';
import Inventory from './Inventory';
import Orders from './Orders';
import EditProduct from './EditProduct';
import Reports from './Reports';
import { useAppContext } from '../../context/AppContext';
import vmsLogo from '../../assets/VMS logo.png';

const AdminSidebar = () => {
  const { pathname } = useLocation();
  const { adminLogout } = useAppContext();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Add Product', path: '/admin/add-product', icon: PlusCircle },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex flex-col items-start gap-4">
        <div className="h-20 w-auto overflow-hidden">
          <img src={vmsLogo} alt="VMS Logo" className="h-full w-auto object-contain hover:scale-105 transition-transform duration-300" />
        </div>
        <div>
          <h1 className="font-black text-white text-xs tracking-widest uppercase">Admin Console</h1>
          <p className="text-[9px] text-green-400 font-black tracking-widest uppercase mt-0.5">Control Center</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1.5 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-200 text-xs font-black uppercase tracking-wider ${isActive
                ? "bg-slate-800 text-white border-l-4 border-green-500 shadow-md shadow-black/10"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
            >
              <item.icon className={`w-4.5 h-4.5 transition-colors ${isActive ? "text-green-400" : "text-slate-500 group-hover:text-white"}`} />
              {item.name}
              {isActive && <ChevronRight className="ml-auto w-3.5 h-3.5 text-green-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 mt-auto border-t border-slate-800/80">
        <button
          onClick={adminLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 text-xs font-black uppercase tracking-wider rounded-none hover:bg-red-500/10 hover:text-red-400 transition-all group"
        >
          <LogOut className="w-4.5 h-4.5 text-red-500/70 group-hover:-translate-x-1 transition-transform" />
          Log Out
        </button>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1">
        {/* Top bar */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-sm font-medium text-slate-400">Welcome back, Admin 👋</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">Hasindu Perera</p>
              <p className="text-[10px] text-green-500 font-medium">Owner</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-none border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Background Gradient */}
                  <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#064E3B" />
                  </linearGradient>
                  {/* Ambient Glow */}
                  <radialGradient id="glow" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                  </radialGradient>
                  {/* Shadow for Avatar Depth */}
                  <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#047857" floodOpacity="0.4"/>
                  </filter>
                </defs>
                
                {/* Base Background */}
                <rect width="100" height="100" fill="url(#avatarGrad)" />
                
                {/* Ambient Glow */}
                <circle cx="50" cy="40" r="35" fill="url(#glow)" />
                
                {/* Stylized Geometric User Body */}
                <path d="M 15 90 C 15 70, 25 60, 50 60 C 75 60, 85 70, 85 90 Z" fill="#ffffff" opacity="0.95" filter="url(#shadow)" />
                      
                {/* Stylized User Head (Floating / Modern) */}
                <circle cx="50" cy="38" r="18" fill="#ffffff" filter="url(#shadow)" />
                
                {/* Modern Geometric Crown/Admin Indicator on Head */}
                <path d="M 44 14 L 50 20 L 56 14 L 53 23 L 47 23 Z" fill="#FBBF24" />
                
                {/* Neon Tech Accent / Micro-lines */}
                <circle cx="50" cy="38" r="22" fill="none" stroke="#34D399" strokeWidth="1.5" strokeDasharray="6 3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/edit/:id" element={<EditProduct />} />
            <Route path="customers" element={<div className="p-10 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">Customer Management Coming Soon</div>} />
            <Route path="orders" element={<Orders />} />
            <Route path="reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
