import React, { useEffect, useState } from 'react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      <div className="bg-white rounded-none border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black tracking-widest uppercase border-b border-slate-50">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={4} className="p-6">Loading...</td></tr>}
              {!loading && orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{o.id}</td>
                  <td className="px-6 py-4">{o.customer?.firstName} {o.customer?.lastName}<div className="text-xs text-slate-400">{o.customer?.email}</div></td>
                  <td className="px-6 py-4">${o.summary?.total}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded-none text-xs">{o.status}</span></td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (<tr><td colSpan={4} className="p-6 text-center text-slate-400">No orders</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
