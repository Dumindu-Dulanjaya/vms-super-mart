import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Edit, Trash2, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
  const { isAdminAuthenticated, currency } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHowTo, setShowHowTo] = useState(false);
  const navigate = useNavigate();

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

  // Find all products that have low stock (< 5 or custom lowStockThreshold)
  const lowStockProducts = products.filter(p => (p.stock || 0) < (p.lowStockThreshold ?? 5));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Inventory</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Manage store products & stock counts</p>
        </div>
        <button 
          onClick={() => setShowHowTo(!showHowTo)} 
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 transition-colors uppercase tracking-wider shadow-sm self-start md:self-auto"
        >
          <HelpCircle className="w-4 h-4 text-green-500" />
          <span>How stock alerts work?</span>
          {showHowTo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Guide section describing how low stock works */}
      {showHowTo && (
        <div className="bg-slate-900 text-slate-100 p-6 shadow-xl space-y-4 animate-fadeIn border-l-4 border-green-500">
          <h3 className="text-sm font-black tracking-widest uppercase text-green-400 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Stock Alert System Guide
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
            The low stock alert triggers automatically for each product based on its <code className="text-green-300 font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded">lowStockThreshold</code> value (default is set to <strong>5 items</strong>).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] font-semibold text-slate-400">
            <div className="p-3.5 bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-red-400 font-bold uppercase block tracking-wider">1. Out of Stock (Red)</span>
              <p className="leading-relaxed">When stock is exactly <strong>0</strong>. Sales are disabled and custom notices display on storefront views.</p>
            </div>
            <div className="p-3.5 bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-yellow-400 font-bold uppercase block tracking-wider">2. Low Stock Warning (Yellow)</span>
              <p className="leading-relaxed">Triggered when stock quantity is less than 5 (<strong>&lt; 5</strong>). Displays warning badges to alert admins to restock immediately.</p>
            </div>
            <div className="p-3.5 bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-green-400 font-bold uppercase block tracking-wider">3. In Stock Status (Green)</span>
              <p className="leading-relaxed">Triggered when stock quantity is safe and equal to or above the threshold (<strong>&ge; 5</strong>).</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            💡 <em>To modify a product's stock count, click the <strong>Edit (Pencil)</strong> icon on the right, update the "Stock Qty" field, and save changes!</em>
          </p>
        </div>
      )}

      {/* Dynamic low stock alert banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 shadow-sm space-y-2 animate-pulse-subtle rounded-none">
          <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-widest">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Low Stock Alert ({lowStockProducts.length} Items Need Attention)</span>
          </div>
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            The following products have dropped below their stock safety limit (less than 5 remaining). Restock immediately to prevent client order cancellations:
          </p>
          <div className="flex flex-wrap gap-2 mt-2 pt-1">
            {lowStockProducts.map(p => (
              <span key={p.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-amber-800 text-[10px] font-black tracking-wide uppercase border border-amber-200 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {p.name} — {p.stock === 0 ? 'Out of Stock' : `Only ${p.stock} left`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-none border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-black tracking-widest uppercase">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-500 border-b-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold text-xs tracking-wider uppercase">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              )}
              
              {!loading && products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Product Info */}
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-none overflow-hidden flex-shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">SKU: VMS-{p.id}</div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-none text-xs font-semibold uppercase tracking-wider">
                      {p.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 font-bold text-slate-800">{currency}{p.price}</td>

                  {/* Stock count and alert triggers */}
                  <td className="px-6 py-4">
                    {(p.stock || 0) === 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-none text-xs font-black uppercase tracking-wider shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                        Out of stock
                      </span>
                    ) : (p.stock || 0) < (p.lowStockThreshold ?? 5) ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-none text-xs font-black uppercase tracking-wider shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Only {p.stock} left
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-none text-xs font-black uppercase tracking-wider shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        {p.stock} in stock
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => navigate(`/admin/inventory/edit/${p.id}`)} 
                        className="p-1.5 bg-slate-50 border border-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-900 transition-all rounded-none"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="p-1.5 bg-red-50 border border-red-100 hover:border-red-300 text-red-500 hover:text-red-700 transition-all rounded-none"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="font-black text-slate-500 uppercase text-xs tracking-widest">No products in inventory</p>
                    <p className="text-xs text-slate-300 mt-1">Add items to view stock details.</p>
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

export default Inventory;
