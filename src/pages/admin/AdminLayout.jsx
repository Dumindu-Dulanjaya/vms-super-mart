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
  ShoppingCart
} from 'lucide-react';
import Dashboard from './Dashboard';
import AddProduct from './AddProduct';
import Inventory from './Inventory';
import Orders from './Orders';
import EditProduct from './EditProduct';
import { useAppContext } from '../../context/AppContext';
import vmsLogo from '../../assets/VMS logo.png';

const AdminSidebar = () => {
  const { pathname } = useLocation();
  const { adminLogout } = useAppContext();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Add Product', path: '/admin/add-product', icon: PlusCircle },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen h-sticky overflow-y-auto">
      <div className="p-6 border-b border-slate-100 flex flex-col items-start gap-4">
        <div className="h-30 w-auto overflow-hidden">
          <img src={vmsLogo} alt="VMS Logo" className="h-full w-auto object-contain" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-sm tracking-tight uppercase">Admin Console</h1>
          <p className="text-[10px] text-green-500 font-black tracking-widest uppercase mt-0.5">Control Center</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-200 text-sm font-medium ${isActive
                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-green-400" : ""}`} />
              {item.name}
              {isActive && <ChevronRight className="ml-auto w-4 h-4 text-slate-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100">
        <button
          onClick={adminLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 text-sm font-medium rounded-none hover:bg-red-50 hover:text-red-600 transition-all font-bold group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
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
            <div className="w-10 h-10 bg-slate-100 rounded-none border-2 border-white shadow-sm overflow-hidden">
              <img src="/api/placeholder/40/40" alt="Admin avatar" />
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
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
