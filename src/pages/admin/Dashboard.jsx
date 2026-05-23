import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { products, currency } = useAppContext();

  const stats = [
    { name: 'Total Products', icon: Package, value: products.length, trend: '+12%', color: 'from-blue-500 to-indigo-600' },
    { name: 'Monthly Sales', icon: BarChart3, value: 'Rs. 12,480', trend: '+18.4%', color: 'from-emerald-500 to-teal-600' },
    { name: 'Total Orders', icon: ShoppingCart, value: '842', trend: '+14.2%', color: 'from-amber-500 to-orange-600' },
    { name: 'Customers', icon: Users, value: '15.2k', trend: '+7.6%', color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Here's what's happening with your store today.</p>
        </div>
        <Link 
          to="/admin/add-product" 
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-none flex items-center gap-2 font-semibold shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 text-green-400" />
          Add New Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-none p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-none bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg shadow-indigo-100`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-none">
                <ArrowUpRight className="w-4 h-4" />
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">{stat.name}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Recent Products Listing */}
      <div className="bg-white rounded-none border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Recent Products</h2>
            <Link to="/admin/inventory" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-2">View All Products</Link>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black tracking-widest uppercase border-b border-slate-50">
                    <tr>
                        <th className="px-8 py-4">Product Details</th>
                        <th className="px-8 py-4">Category</th>
                        <th className="px-8 py-4">Price</th>
                        <th className="px-8 py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {products.slice(0, 5).map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-8 py-4 flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-100 rounded-none overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 transform group-hover:scale-105 transition-all">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                                    <p className="text-xs text-slate-400 font-medium">SKU: VMS-{p.id}</p>
                                </div>
                            </td>
                            <td className="px-8 py-4">
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-none uppercase tracking-wider">{p.category}</span>
                            </td>
                            <td className="px-8 py-4">
                                <p className="font-black text-slate-900 text-sm">{currency}{p.price}</p>
                            </td>
                            <td className="px-8 py-4">
                                <button className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Manage</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {products.length === 0 && <div className="p-12 text-center text-slate-400 bg-white border-t border-slate-50">No products found. Start adding some results!</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
