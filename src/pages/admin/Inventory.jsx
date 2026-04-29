import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
  const { isAdminAuthenticated } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem('vms_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      alert('Delete failed');
    }
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
      </div>

      <div className="bg-white rounded-none border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black tracking-widest uppercase border-b border-slate-50">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={5} className="p-6">Loading...</td></tr>}
              {!loading && products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-none overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs text-slate-400">SKU: VMS-{p.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded-none text-slate-600 text-xs">{p.category}</span></td>
                  <td className="px-6 py-4">${p.price}</td>
                  <td className="px-6 py-4">
                    {(p.stock || 0) === 0 ? (
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded-none text-xs font-semibold">Out of stock</span>
                    ) : (p.stock || 0) < (p.lowStockThreshold ?? 5) ? (
                      <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-none text-xs font-semibold">Only {p.stock} left</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-none text-xs font-semibold">{p.stock} in stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => navigate(`/admin/inventory/edit/${p.id}`)} className="mr-2 text-slate-500 hover:text-slate-900"><Edit /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><Trash2 /></button>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (<tr><td colSpan={5} className="p-6 text-center text-slate-400">No products</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
