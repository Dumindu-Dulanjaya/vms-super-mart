import React, { useEffect, useState } from 'react';
import { ShoppingBag, Calendar, MapPin, Phone, Mail } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const currency = "Rs.";

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('vms_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'delivered':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Track and fulfill client purchases</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-100 shadow-sm text-xs font-semibold text-slate-600">
          <ShoppingBag className="w-4 h-4 text-green-500" />
          <span>Total Orders: {orders.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-none border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-black tracking-widest uppercase">
              <tr>
                <th className="px-6 py-4">Order ID & Date</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Items Purchased</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-500 border-b-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold text-xs tracking-wider uppercase">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              )}
              
              {!loading && orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Order ID & Date */}
                  <td className="px-6 py-5">
                    <div className="font-mono text-xs font-black text-slate-800 tracking-tight">{o.id}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      {new Date(o.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>

                  {/* Customer Info */}
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800">{o.customer?.firstName} {o.customer?.lastName}</div>
                    <div className="space-y-1 mt-1.5 text-xs text-slate-400 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        <span>{o.customer?.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                        <span>{o.customer?.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                        <span className="truncate max-w-[220px]">{o.customer?.address}, {o.customer?.city}</span>
                      </div>
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      {o.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider">
                            x{item.quantity}
                          </span>
                          <span className="text-xs text-slate-700 font-semibold truncate max-w-[200px]" title={item.name}>
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Total price */}
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800 text-base">{currency}{o.summary?.total}</div>
                    <div className="text-[10px] text-green-500 font-black tracking-wider uppercase mt-1">
                      {o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Card'}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-block px-3 py-1.5 rounded-none text-[10px] font-black tracking-widest uppercase transition-all shadow-sm ${getStatusStyle(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="font-black text-slate-500 uppercase text-xs tracking-widest">No orders placed yet</p>
                    <p className="text-xs text-slate-300 mt-1">When clients complete checkouts, their orders will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
