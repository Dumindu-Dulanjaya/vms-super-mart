import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Edit, Trash2, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Package, Calendar, Coins, ShieldAlert, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
  const { isAdminAuthenticated, currency } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHowTo, setShowHowTo] = useState(false);
  const navigate = useNavigate();

  // FIFO Batch states
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [batches, setBatches] = useState({});
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [batchProduct, setBatchProduct] = useState(null);
  const [batchFormData, setBatchFormData] = useState({
    batchNumber: '',
    quantity: '',
    purchasePrice: '',
    receivedAt: new Date().toISOString().split('T')[0],
    expiryDate: '',
    sellingPrice: '',
    regularPrice: ''
  });

  const generateBatchNumber = (productBatches = []) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const datePart = todayStr.replace(/-/g, '');
    const todayBatchesCount = productBatches.filter(b => {
      if (!b.receivedAt) return false;
      const batchDate = new Date(b.receivedAt).toISOString().split('T')[0];
      return batchDate === todayStr;
    }).length;
    const seq = String(todayBatchesCount + 1).padStart(2, '0');
    return `${datePart}-${seq}`;
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products?admin=true`);
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

  const toggleExpand = async (product) => {
    if (expandedProduct === product.id) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(product.id);
      setBatchesLoading(true);
      try {
        const token = localStorage.getItem('vms_admin_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/${product.id}/batches`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setBatches(prev => ({ ...prev, [product.id]: data }));
      } catch (e) {
        console.error(e);
      } finally {
        setBatchesLoading(false);
      }
    }
  };

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('vms_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/${batchProduct.id}/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          batchNumber: batchFormData.batchNumber || undefined,
          quantity: Number(batchFormData.quantity),
          purchasePrice: Number(batchFormData.purchasePrice),
          receivedAt: batchFormData.receivedAt || undefined,
          expiryDate: batchFormData.expiryDate || undefined,
          sellingPrice: batchFormData.sellingPrice ? Number(batchFormData.sellingPrice) : undefined,
          regularPrice: batchFormData.regularPrice ? Number(batchFormData.regularPrice) : undefined
        })
      });

      if (!res.ok) throw new Error('Failed to add batch');
      const newBatch = await res.json();

      setBatches(prev => ({
        ...prev,
        [batchProduct.id]: [...(prev[batchProduct.id] || []), newBatch]
      }));

      await load();
      setShowAddBatchModal(false);
      setBatchFormData({
        batchNumber: '',
        quantity: '',
        purchasePrice: '',
        receivedAt: new Date().toISOString().split('T')[0],
        expiryDate: '',
        sellingPrice: '',
        regularPrice: ''
      });
    } catch (e) {
      alert('Failed to add batch: ' + e.message);
    }
  };

  const handleDeleteBatch = async (productId, batchId) => {
    if (!confirm('Delete this stock batch? This will deduct its quantity from the product stock.')) return;
    try {
      const token = localStorage.getItem('vms_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/batches/${batchId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');

      setBatches(prev => ({
        ...prev,
        [productId]: (prev[productId] || []).filter(b => b.id !== batchId)
      }));

      await load();
    } catch (e) {
      alert('Failed to delete batch: ' + e.message);
    }
  };

  const lowStockProducts = products.filter(p => (p.stock || 0) < (p.lowStockThreshold ?? 5));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Inventory</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Manage store products & stock batches (FIFO)</p>
        </div>
        <button 
          onClick={() => setShowHowTo(!showHowTo)} 
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 transition-colors uppercase tracking-wider shadow-sm self-start md:self-auto"
        >
          <HelpCircle className="w-4 h-4 text-green-500" />
          <span>How stock batches work?</span>
          {showHowTo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Guide section */}
      {showHowTo && (
        <div className="bg-slate-900 text-slate-100 p-6 shadow-xl space-y-4 animate-fadeIn border-l-4 border-green-500">
          <h3 className="text-sm font-black tracking-widest uppercase text-green-400 flex items-center gap-2">
            <Package className="w-4 h-4" />
            FIFO Batch Stock Alert System Guide
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
            This inventory implements the **FIFO (First In, First Out)** method. When items are checked out by customers, stock is automatically depleted from the oldest active batch first.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] font-semibold text-slate-400">
            <div className="p-3.5 bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-green-400 font-bold uppercase block tracking-wider">1. Receive Batches</span>
              <p className="leading-relaxed">Click **"Add Batch"** to add a new delivery. Enter purchase costs and optional expiry dates to trace batches uniquely.</p>
            </div>
            <div className="p-3.5 bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-yellow-400 font-bold uppercase block tracking-wider">2. Expiring Alert</span>
              <p className="leading-relaxed">Batches displaying a red expiry date indicate expired inventory that should be pulled from active shelf listing.</p>
            </div>
            <div className="p-3.5 bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-blue-400 font-bold uppercase block tracking-wider">3. FIFO Auto-depletion</span>
              <p className="leading-relaxed">During customer checkouts, backend code sequentially subtracts counts from oldest active batches to youngest.</p>
            </div>
          </div>
        </div>
      )}

      {/* Low stock alert banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 shadow-sm space-y-2 animate-pulse-subtle rounded-none">
          <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-widest">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Low Stock Alert ({lowStockProducts.length} Items Need Attention)</span>
          </div>
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
                <th className="px-6 py-4">Total Stock</th>
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
              
              {!loading && products.map(p => {
                const isExpanded = expandedProduct === p.id;
                const productBatches = batches[p.id] || [];
                return (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <button
                          onClick={() => toggleExpand(p)}
                          className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                          title="View Batches (FIFO)"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-green-500" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-none overflow-hidden flex-shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            {p.name}
                            <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1 rounded uppercase tracking-wider">FIFO</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 font-mono">SKU: VMS-{p.id}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-none text-xs font-semibold uppercase tracking-wider">
                          {p.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-800">{currency}{p.price}</td>

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

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={async () => {
                              setBatchProduct(p);
                              let productBatches = batches[p.id];
                              if (!productBatches) {
                                try {
                                  const token = localStorage.getItem('vms_admin_token');
                                  const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/${p.id}/batches`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  productBatches = await res.json();
                                  setBatches(prev => ({ ...prev, [p.id]: productBatches }));
                                } catch (e) {
                                  productBatches = [];
                                }
                              }
                              const batchNo = generateBatchNumber(productBatches);
                              setBatchFormData(prev => ({
                                ...prev,
                                batchNumber: batchNo
                              }));
                              setShowAddBatchModal(true);
                            }}
                            className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors shadow-sm"
                            title="Add Stock Batch"
                          >
                            Add Batch
                          </button>
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

                    {/* Collapsible batch grid sub-row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="px-12 py-5">
                          <div className="border border-slate-200 shadow-inner bg-white p-5 space-y-4 rounded-none">
                            <div className="flex items-center justify-between border-b pb-3">
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                <Package className="w-4 h-4 text-green-500" />
                                Active Stock Batches (FIFO Flow)
                              </h4>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Oldest batches are depleted first during checkout</span>
                            </div>
                            
                            {batchesLoading ? (
                              <div className="text-center py-6 text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-green-500 border-b-transparent rounded-full animate-spin"></div>
                                Loading batches...
                              </div>
                            ) : productBatches.length === 0 ? (
                              <div className="text-center py-6 text-slate-400 text-xs font-semibold uppercase">
                                No active batches found for this product. Click "Add Batch" to restock.
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[9px] font-black tracking-widest uppercase">
                                    <tr>
                                      <th className="px-4 py-2">Batch Number</th>
                                      <th className="px-4 py-2">Date Received</th>
                                      <th className="px-4 py-2">Expiry Date</th>
                                      <th className="px-4 py-2">Purchase Cost</th>
                                      <th className="px-4 py-2">Regular Price</th>
                                      <th className="px-4 py-2">Selling Price</th>
                                      <th className="px-4 py-2">Stock Level (Initial)</th>
                                      <th className="px-4 py-2 text-center">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {productBatches.map(b => {
                                      const isExpired = b.expiryDate && new Date(b.expiryDate) < new Date();
                                      return (
                                        <tr key={b.id} className={`hover:bg-slate-50/50 transition-colors ${b.quantity === 0 ? 'opacity-40' : ''}`}>
                                          <td className="px-4 py-3 font-mono font-bold text-slate-700">{b.batchNumber}</td>
                                          <td className="px-4 py-3 text-slate-500 font-semibold">
                                            {new Date(b.receivedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                          </td>
                                          <td className="px-4 py-3 font-semibold">
                                            {b.expiryDate ? (
                                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                isExpired ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'
                                              }`}>
                                                {new Date(b.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                {isExpired && ' (Expired)'}
                                              </span>
                                            ) : (
                                              <span className="text-slate-300 font-normal">N/A</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-3 text-slate-700 font-bold">{currency}{Number(b.purchasePrice).toFixed(2)}</td>
                                          <td className="px-4 py-3 text-slate-400 line-through font-semibold">
                                            {b.regularPrice && b.regularPrice > b.sellingPrice ? `${currency}${Number(b.regularPrice).toFixed(2)}` : 'N/A'}
                                          </td>
                                          <td className="px-4 py-3 text-green-600 font-bold">{currency}{Number(b.sellingPrice || 0).toFixed(2)}</td>
                                          <td className="px-4 py-3 font-semibold">
                                            {b.quantity === 0 ? (
                                              <span className="text-red-500 font-bold uppercase text-[9px] tracking-wide bg-red-50 px-1.5 py-0.5 rounded">Depleted</span>
                                            ) : (
                                              <span className="text-slate-800 font-black">{b.quantity} <span className="text-slate-400 font-normal">/ {b.initialQuantity} remaining</span></span>
                                            )}
                                          </td>
                                          <td className="px-4 py-3 text-center">
                                            <button
                                              onClick={() => handleDeleteBatch(p.id, b.id)}
                                              className="p-1 bg-red-50 border border-red-100 hover:border-red-300 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                              title="Delete Batch"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

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

      {/* Add Stock Batch Modal */}
      {showAddBatchModal && batchProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-[100] animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] w-[450px] border border-slate-800 p-8 space-y-6">
            <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-green-500" />
                Receive Stock Batch
              </h3>
              <button 
                onClick={() => setShowAddBatchModal(false)}
                className="text-slate-400 hover:text-white font-black text-sm cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] text-green-400 font-black uppercase tracking-wider">Product Target</span>
              <p className="text-sm font-bold text-slate-100">{batchProduct.name}</p>
            </div>

            <form onSubmit={handleAddBatchSubmit} className="space-y-4 text-slate-900">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Batch Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="e.g. 50"
                    value={batchFormData.quantity}
                    onChange={(e) => setBatchFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Purchase Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="Cost per unit"
                    value={batchFormData.purchasePrice}
                    onChange={(e) => setBatchFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Batch Number (Optional)</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="Auto-generated"
                    value={batchFormData.batchNumber}
                    onChange={(e) => setBatchFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Date Received</label>
                  <input
                    type="date"
                    required
                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                    value={batchFormData.receivedAt}
                    onChange={(e) => setBatchFormData(prev => ({ ...prev, receivedAt: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Batch Regular Price (Rs.) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                    placeholder={batchProduct.oldPrice ? `Default: Rs. ${batchProduct.oldPrice}` : `Default: Rs. ${batchProduct.price}`}
                    value={batchFormData.regularPrice}
                    onChange={(e) => setBatchFormData(prev => ({ ...prev, regularPrice: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Batch Selling Price (Rs.) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                    placeholder={`Default: Rs. ${batchProduct.price}`}
                    value={batchFormData.sellingPrice}
                    onChange={(e) => setBatchFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                    value={batchFormData.expiryDate}
                    onChange={(e) => setBatchFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  {/* Spacer */}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#00FF33] hover:bg-[#00CC29] text-slate-900 font-black uppercase py-3 rounded-none transition tracking-widest text-xs border-none cursor-pointer"
                >
                  Confirm Restock
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="flex-1 border border-slate-700 text-slate-400 font-black uppercase py-3 rounded-none hover:bg-slate-800 transition tracking-widest text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
