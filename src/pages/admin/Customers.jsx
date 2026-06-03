import React, { useEffect, useState } from 'react';
import { Users, Calendar, MapPin, Phone, Mail, Shield, Search } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('vms_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
        setFilteredCustomers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.phone && c.phone.includes(query)) ||
        (c.city && c.city.toLowerCase().includes(query))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Customer Directory</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Browse and manage registered users</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-100 shadow-sm text-xs font-semibold text-slate-600">
          <Users className="w-4 h-4 text-green-500" />
          <span>Registered Shoppers: {customers.length}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center text-sm gap-3 border border-slate-200/60 bg-white px-4 py-3 shadow-sm max-w-md">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          className="w-full bg-transparent outline-none text-slate-700 placeholder-slate-400 font-medium"
          placeholder="Search customers by name, email, or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-none border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-black tracking-widest uppercase">
              <tr>
                <th className="px-6 py-4">Customer ID & Joining Date</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Delivery Address</th>
                <th className="px-6 py-4 text-center">System Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-500 border-b-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold text-xs tracking-wider uppercase">Loading shopper records...</span>
                    </div>
                  </td>
                </tr>
              )}
              
              {!loading && filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Customer ID & Date */}
                  <td className="px-6 py-5">
                    <div className="font-mono text-xs font-black text-slate-800 tracking-tight">#{c.id}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      {new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800">{c.firstName} {c.lastName}</div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                      Customer Profile
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="px-6 py-5">
                    <div className="space-y-1 text-xs text-slate-600 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.phone || <em className="text-slate-300 font-normal">No phone</em>}</span>
                      </div>
                    </div>
                  </td>

                  {/* Address */}
                  <td className="px-6 py-5">
                    {c.address ? (
                      <div className="space-y-1 text-xs text-slate-600 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[250px]">{c.address}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider pl-5">
                          {c.city}, {c.province || 'LK'} {c.postalCode && `(${c.postalCode})`}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-300 font-normal pl-5">No address saved</div>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black tracking-widest uppercase transition-all shadow-sm ${
                      c.role === 'admin' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {c.role}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="font-black text-slate-500 uppercase text-xs tracking-widest">No matching shoppers found</p>
                    <p className="text-xs text-slate-300 mt-1">Make sure spelling is correct or query has registered profiles.</p>
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

export default Customers;
