import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  PackagePlus, 
  Upload, 
  Image as ImageIcon,
  DollarSign,
  Layers,
  FileText,
  Save,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const { addProduct, categories, navigate } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    category: '',
    image: '',
  });
  
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || !formData.image) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      
      // Upload actual file if selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);
        
        const token = localStorage.getItem('vms_admin_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadData
        });
        
        if (res.ok) {
          const data = await res.json();
          // API URL could be prepended if needed, but relative path works if proxying or backend is same host.
          finalImageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${data.url}`;
        } else {
          toast.error('Failed to upload image. Using base64 preview.');
        }
      }

      await addProduct({
        ...formData,
        image: finalImageUrl,
        price: Number(formData.price),
        oldPrice: Number(formData.oldPrice) || Number(formData.price) * 1.2,
      });
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 bg-white border border-slate-200 rounded-none hover:bg-slate-50 transition-colors shadow-sm">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add New Product</h1>
                <p className="text-slate-500 font-medium">Create a new item in your store inventory.</p>
            </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-none p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-400 tracking-widest uppercase mb-2">Product Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  placeholder="e.g., Organic Red Apples"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-800 placeholder-slate-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-slate-400 tracking-widest uppercase mb-2">Price ($)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={onChange}
                    placeholder="25.00"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-800 placeholder-slate-300"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-400 tracking-widest uppercase mb-2">Regular Price ($)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Trash2 className="h-5 w-5 text-slate-200 group-focus-within:text-slate-400 transition-colors" />
                  </div>
                  <input 
                    type="number" 
                    name="oldPrice"
                    value={formData.oldPrice}
                    onChange={onChange}
                    placeholder="30.00"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-400 placeholder-slate-200"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-400 tracking-widest uppercase mb-2">Category</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Layers className="h-5 w-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-all font-semibold text-slate-800"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Home">Home Items</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
               <button 
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-slate-900 group hover:shadow-2xl hover:shadow-indigo-200 text-white p-5 rounded-none font-black text-lg transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-b-2 border-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-6 h-6 text-green-400 group-hover:rotate-12 transition-transform" />
                    Publish Product
                  </>
                )}
              </button>
          </div>
        </div>

        {/* Right Column: Image Upload */}
        <div className="space-y-6">
          <div className="bg-white rounded-none p-8 border border-slate-100 shadow-sm">
            <label className="block text-sm font-black text-slate-400 tracking-widest uppercase mb-4 text-center">Product Image</label>
            <div className="relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-none overflow-hidden group hover:border-indigo-400 transition-colors">
              {preview ? (
                <div className="relative aspect-square">
                  <img src={preview} alt="Product preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <label className="bg-white text-slate-900 p-4 rounded-none cursor-pointer font-bold shadow-2xl">
                      <Upload className="w-6 h-6 inline-block mr-2" />
                      Replace
                      <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-12 cursor-pointer aspect-square">
                  <div className="w-16 h-16 bg-white rounded-none flex items-center justify-center text-slate-400 group-hover:text-indigo-500 shadow-sm transition-colors mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <span className="text-slate-400 font-bold">Choose File</span>
                  <p className="text-[10px] text-slate-300 mt-1 uppercase font-black tracking-widest">JPG, PNG or WEBP</p>
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              )}
            </div>
            
            <div className="mt-6 space-y-4">
               <div className="p-4 bg-amber-50 rounded-none border border-amber-100">
                  <p className="text-xs text-amber-700 font-medium leading-relaxed italic">
                    💡 High-quality images (1:1 ratio) attract 40% more customers.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
