import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  Zap,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Percent,
  Clock,
  Calendar,
  AlertTriangle,
  PlusCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const FlashSaleManagement = () => {
  const { currency } = useAppContext();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSaleId, setExpandedSaleId] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [targetSaleId, setTargetSaleId] = useState(null);

  // Forms state
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    isActive: false,
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    productId: '',
    discountPercentage: '10',
    salePrice: '',
  });

  // Fetch all flash sales
  const loadSales = async () => {
    try {
      const token = localStorage.getItem('vms_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/flash-sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      }
    } catch (e) {
      console.error('Failed to load flash sales', e);
    }
  };

  // Fetch all products (admin view)
  const loadProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products?admin=true`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to load products', e);
    }
  };

  const init = async () => {
    setLoading(true);
    await Promise.all([loadSales(), loadProducts()]);
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  // Handle Create / Update Sale Submit
  const handleSaveSaleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(createFormData.endTime) <= new Date(createFormData.startTime)) {
      toast.error('End time must be after start time!');
      return;
    }

    try {
      const token = localStorage.getItem('vms_admin_token');
      const url = editingSale 
        ? `${import.meta.env.VITE_API_URL || ''}/api/flash-sales/${editingSale.id}`
        : `${import.meta.env.VITE_API_URL || ''}/api/flash-sales`;
      
      const method = editingSale ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createFormData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Operation failed');
      }

      toast.success(editingSale ? 'Flash Sale updated!' : 'Flash Sale created!');
      setShowCreateModal(false);
      setEditingSale(null);
      setCreateFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        isActive: false,
      });
      await loadSales();
    } catch (err) {
      toast.error(err.message || 'Failed to save flash sale');
    }
  };

  // Handle toggle active state
  const handleToggleActive = async (sale) => {
    try {
      const token = localStorage.getItem('vms_admin_token');
      const nextActive = !sale.isActive;
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/flash-sales/${sale.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: nextActive }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Toggle failed');
      }

      toast.success(nextActive ? 'Flash Sale Activated!' : 'Flash Sale Deactivated!');
      await loadSales();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle active state');
    }
  };

  // Handle delete sale
  const handleDeleteSale = async (id) => {
    if (!confirm('Are you sure you want to delete this Flash Sale? All product linkages will be removed.')) return;

    try {
      const token = localStorage.getItem('vms_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/flash-sales/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Delete failed');

      toast.success('Flash Sale deleted successfully!');
      if (expandedSaleId === id) setExpandedSaleId(null);
      await loadSales();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!productFormData.productId) {
      toast.error('Please select a product');
      return;
    }
    if (Number(productFormData.salePrice) >= Number(selectedProduct.price)) {
      toast.error('Sale price must be lower than original price!');
      return;
    }

    try {
      const token = localStorage.getItem('vms_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/flash-sales/${targetSaleId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: Number(productFormData.productId),
          discountPercentage: Number(productFormData.discountPercentage),
          salePrice: Number(productFormData.salePrice),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add product');
      }

      toast.success('Product added to Flash Sale!');
      setShowAddProductModal(false);
      setSelectedProduct(null);
      setProductFormData({
        productId: '',
        discountPercentage: '10',
        salePrice: '',
      });
      await loadSales();
    } catch (err) {
      toast.error(err.message || 'Failed to add product');
    }
  };

  // Handle Remove Product
  const handleRemoveProduct = async (saleId, productId) => {
    if (!confirm('Remove this product from the Flash Sale?')) return;

    try {
      const token = localStorage.getItem('vms_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/flash-sales/${saleId}/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to remove product');

      toast.success('Product removed from Flash Sale!');
      await loadSales();
    } catch (err) {
      toast.error(err.message || 'Remove failed');
    }
  };

  // Sync Discount & Sale Price Bidirectionally
  const handleDiscountChange = (val, basePrice) => {
    const disc = Number(val) || 0;
    const computedPrice = basePrice * (1 - disc / 100);
    setProductFormData(prev => ({
      ...prev,
      discountPercentage: val,
      salePrice: computedPrice > 0 ? String(Math.round(computedPrice * 100) / 100) : '',
    }));
  };

  const handleSalePriceChange = (val, basePrice) => {
    const saleVal = Number(val) || 0;
    const computedDiscount = ((basePrice - saleVal) / basePrice) * 100;
    setProductFormData(prev => ({
      ...prev,
      salePrice: val,
      discountPercentage: saleVal > 0 ? String(Math.round(computedDiscount * 100) / 100) : '0',
    }));
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Determine current active product lists and filters
  const activeSaleProducts = targetSaleId 
    ? sales.find(s => s.id === targetSaleId)?.flashSaleProducts?.map(fp => fp.productId) || []
    : [];

  const eligibleProducts = products.filter(p => p.stock > 0 && !activeSaleProducts.includes(p.id));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Flash Sale Management</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Create and configure time-bound store promotions</p>
        </div>
        <button
          onClick={() => {
            setEditingSale(null);
            setCreateFormData({
              title: '',
              description: '',
              startTime: '',
              endTime: '',
              isActive: false,
            });
            setShowCreateModal(true);
          }}
          className="text-xs font-black uppercase tracking-wider px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-2 rounded-none self-start md:self-auto shadow-md"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Flash Sale
        </button>
      </div>

      {/* Main content table */}
      <div className="bg-white rounded-none border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-black tracking-widest uppercase">
              <tr>
                <th className="px-6 py-4">Flash Sale Info</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Show on Homepage</th>
                <th className="px-6 py-4">Products count</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-500 border-b-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold text-xs tracking-wider uppercase">Loading flash sales...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && sales.map(sale => {
                const isExpanded = expandedSaleId === sale.id;
                return (
                  <React.Fragment key={sale.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <button
                          onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                          className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                          title="Manage Products"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-green-500" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <div>
                          <div className="font-bold text-slate-800">{sale.title}</div>
                          {sale.description && <div className="text-[11px] text-slate-400 mt-0.5">{sale.description}</div>}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateTime(sale.startTime)} — {formatDateTime(sale.endTime)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {sale.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-none text-[10px] font-black uppercase tracking-wider shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping"></span>
                            Active
                          </span>
                        ) : sale.status === 'scheduled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-none text-[10px] font-black uppercase tracking-wider shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Scheduled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-150 text-slate-500 border border-slate-200 rounded-none text-[10px] font-black uppercase tracking-wider shadow-sm bg-slate-100">
                            Expired
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(sale)}
                          disabled={sale.status === 'expired'}
                          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                            sale.isActive ? 'bg-green-500' : 'bg-slate-300'
                          } ${sale.status === 'expired' ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                              sale.isActive ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      <td className="px-6 py-4 font-black text-slate-600 text-xs">
                        {sale.flashSaleProducts?.length || 0} Product(s)
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setEditingSale(sale);
                              setCreateFormData({
                                title: sale.title,
                                description: sale.description || '',
                                startTime: new Date(sale.startTime).toISOString().slice(0, 16),
                                endTime: new Date(sale.endTime).toISOString().slice(0, 16),
                                isActive: sale.isActive,
                              });
                              setShowCreateModal(true);
                            }}
                            className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors shadow-sm"
                          >
                            Edit Schedule
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="p-1.5 bg-red-50 border border-red-100 hover:border-red-350 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Manage products sub-row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="px-12 py-5">
                          <div className="border border-slate-200 shadow-inner bg-white p-5 space-y-4 rounded-none">
                            <div className="flex items-center justify-between border-b pb-3">
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-orange-500" />
                                Flash Sale Campaign Products
                              </h4>
                              <button
                                onClick={() => {
                                  setTargetSaleId(sale.id);
                                  setSelectedProduct(null);
                                  setProductFormData({
                                    productId: '',
                                    discountPercentage: '10',
                                    salePrice: '',
                                  });
                                  setShowAddProductModal(true);
                                }}
                                disabled={sale.status === 'expired'}
                                className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                Add Product to Sale
                              </button>
                            </div>

                            {sale.flashSaleProducts?.length === 0 ? (
                              <div className="text-center py-6 text-slate-400 text-xs font-semibold uppercase">
                                No products associated with this sale campaign. Click "Add Product to Sale" to configure.
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[9px] font-black tracking-widest uppercase">
                                    <tr>
                                      <th className="px-4 py-2">Product</th>
                                      <th className="px-4 py-2">Base Shelf Price</th>
                                      <th className="px-4 py-2">Sale Price</th>
                                      <th className="px-4 py-2">Discount</th>
                                      <th className="px-4 py-2 text-center">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {sale.flashSaleProducts.map(fp => (
                                      <tr key={fp.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 flex items-center gap-3 font-semibold text-slate-700">
                                          <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-none overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            <img src={fp.product?.image} alt={fp.product?.name} className="w-full h-full object-contain" />
                                          </div>
                                          <span>{fp.product?.name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 line-through font-semibold">
                                          {currency}{Number(fp.product?.price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-green-600 font-bold">
                                          {currency}{Number(fp.salePrice).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 font-bold flex items-center gap-1">
                                          <TrendingDown className="w-3.5 h-3.5 text-orange-500" />
                                          <span className="text-orange-600 font-black">{fp.discountPercentage}% OFF</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <button
                                            onClick={() => handleRemoveProduct(sale.id, fp.productId)}
                                            className="p-1 bg-red-50 border border-red-100 hover:border-red-300 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                            title="Remove from Flash Sale"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
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

              {!loading && sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Clock className="w-12 h-12 text-slate-350 mx-auto mb-4 text-slate-300" />
                    <p className="font-black text-slate-500 uppercase text-xs tracking-widest">No flash sale campaigns configured</p>
                    <p className="text-xs text-slate-300 mt-1">Click "Create Flash Sale" in the top bar to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Flash Sale Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-[100] animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] w-[480px] border border-slate-800 p-8 space-y-6">
            <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                {editingSale ? 'Edit Flash Sale Schedule' : 'Create Flash Sale'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white font-black text-sm cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSaleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Campaign Title</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="e.g. Midweek Summer Splash"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Campaign Description (Optional)</label>
                <textarea
                  className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                  rows={2}
                  placeholder="Details or terms of the flash sale"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                    value={createFormData.startTime}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                    value={createFormData.endTime}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 py-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-green-600 bg-slate-800 border-slate-700 focus:ring-green-500 focus:ring-2"
                  checked={createFormData.isActive}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="isActive" className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Activate immediately on schedule match
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-slate-950 font-black uppercase py-3 rounded-none transition tracking-widest text-xs border-none cursor-pointer"
                >
                  Save Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-slate-700 text-slate-400 font-black uppercase py-3 rounded-none hover:bg-slate-800 transition tracking-widest text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product to Flash Sale Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-[100] animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] w-[450px] border border-slate-800 p-8 space-y-6">
            <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Add Product to Flash Sale
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-white font-black text-sm cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-slate-900">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Select Product</label>
                <select
                  required
                  className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                  value={productFormData.productId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const prod = products.find(p => p.id === Number(id));
                    setSelectedProduct(prod || null);
                    setProductFormData(prev => ({
                      ...prev,
                      productId: id,
                      salePrice: prod ? String(Math.round(prod.price * 0.9 * 100) / 100) : '',
                      discountPercentage: '10'
                    }));
                  }}
                >
                  <option value="" className="text-slate-500 bg-slate-900">-- Choose Catalog Item --</option>
                  {eligibleProducts.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.name} (Rs. {p.price} | Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="p-4 bg-slate-800/50 border border-slate-850 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-800 border rounded flex items-center justify-center p-1 overflow-hidden">
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-wide">Selected Item</p>
                      <p className="text-sm font-bold text-white">{selectedProduct.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Discount %</label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min="0.01"
                          max="99.99"
                          step="0.01"
                          required
                          className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors pr-8"
                          value={productFormData.discountPercentage}
                          onChange={(e) => handleDiscountChange(e.target.value, selectedProduct.price)}
                        />
                        <Percent className="w-3.5 h-3.5 text-slate-500 absolute right-3" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Sale Price (Rs.)</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        className="w-full p-3 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-none focus:outline-none focus:border-green-500 transition-colors"
                        value={productFormData.salePrice}
                        onChange={(e) => handleSalePriceChange(e.target.value, selectedProduct.price)}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-semibold border-t border-slate-800 pt-2 flex justify-between">
                    <span>Base Shelf Price:</span>
                    <span className="text-white font-bold">Rs. {selectedProduct.price}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={!selectedProduct}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-slate-950 font-black uppercase py-3 rounded-none transition tracking-widest text-xs border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Add to Sale
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
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

export default FlashSaleManagement;
