import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ChevronLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdminAuthenticated } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', price: '', oldPrice: '', category: '', image: '', description: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/${id}`);
        const data = await res.json();
        setFormData({
          name: data.name || '',
          price: data.price || '',
          oldPrice: data.oldPrice || data.price || '',
          category: data.category || '',
          image: data.image || '',
          description: data.description || ''
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('vms_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          oldPrice: Number(formData.oldPrice),
          category: formData.category,
          image: formData.image,
          description: formData.description,
        })
      });
      if (!res.ok) throw new Error('Update failed');
      navigate('/admin/inventory');
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/inventory')} className="p-2 bg-white border rounded-sm">
          <ChevronLeft />
        </button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 border">
            <label className="block text-sm font-medium">Name</label>
            <input name="name" value={formData.name} onChange={onChange} className="w-full p-3 border mt-2" />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <input name="price" type="number" value={formData.price} onChange={onChange} className="w-full p-3 border" />
              <input name="oldPrice" type="number" value={formData.oldPrice} onChange={onChange} className="w-full p-3 border" />
            </div>

            <label className="block text-sm font-medium mt-4">Category</label>
            <input name="category" value={formData.category} onChange={onChange} className="w-full p-3 border mt-2" />

            <label className="block text-sm font-medium mt-4">Description</label>
            <textarea name="description" value={formData.description} onChange={onChange} className="w-full p-3 border mt-2" rows={6} />
          </div>

          <div className="flex gap-4">
             <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-sm flex items-center gap-2">
               <Save /> Save
             </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 border">
            <label className="block text-sm font-medium">Image URL</label>
            <input name="image" value={formData.image} onChange={onChange} className="w-full p-3 border mt-2" />
            {formData.image && <img src={formData.image} alt="preview" className="mt-4 w-full h-48 object-cover" />}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
