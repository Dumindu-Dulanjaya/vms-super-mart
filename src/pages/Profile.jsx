import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Lock, MapPin, Plus, Trash2, Edit2, Check, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUserProfile, changePassword, navigate } = useAppContext();
  const [activeTab, setActiveTab] = useState('account'); // 'account' or 'addresses'
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Address modal/form state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: 'Western',
  });

  const mapInstanceRef = React.useRef(null);
  const markerRef = React.useRef(null);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        
        // Match Sri Lankan provinces
        const stateName = addr.state || addr.province || '';
        let matchedProvince = '';
        if (stateName.toLowerCase().includes('western')) matchedProvince = 'Western';
        else if (stateName.toLowerCase().includes('central')) matchedProvince = 'Central';
        else if (stateName.toLowerCase().includes('southern')) matchedProvince = 'Southern';
        else if (stateName.toLowerCase().includes('northern')) matchedProvince = 'Northern';
        else if (stateName.toLowerCase().includes('eastern')) matchedProvince = 'Eastern';
        else if (stateName.toLowerCase().includes('north western')) matchedProvince = 'North Western';
        else if (stateName.toLowerCase().includes('north central')) matchedProvince = 'North Central';
        else if (stateName.toLowerCase().includes('uva')) matchedProvince = 'Uva';
        else if (stateName.toLowerCase().includes('sabaragamuwa')) matchedProvince = 'Sabaragamuwa';

        const road = addr.road || addr.suburb || addr.neighbourhood || '';
        const village = addr.village || addr.suburb || addr.town || '';
        const streetAddress = road ? `${road}${village ? ', ' + village : ''}` : (data.display_name || '');

        setAddressForm((prev) => ({
          ...prev,
          address: streetAddress,
          city: addr.city || addr.town || addr.village || addr.suburb || '',
          postalCode: addr.postcode || '',
          province: matchedProvince || prev.province || 'Western'
        }));
        
        toast.success('Address auto-filled from map!');
      }
    } catch (err) {
      console.error('Failed to reverse geocode', err);
    }
  };

  const forwardGeocode = async (address, city, map, marker) => {
    try {
      const query = `${address}, ${city}, Sri Lanka`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          const { lat, lon } = results[0];
          const latLng = [parseFloat(lat), parseFloat(lon)];
          map.setView(latLng, 16);
          marker.setLatLng(latLng);
        }
      }
    } catch (err) {
      console.error('Failed to forward geocode', err);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    toast.loading('Detecting your GPS location...', { id: 'gps-loading' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        toast.dismiss('gps-loading');
        toast.success('Live location detected!');

        if (mapInstanceRef.current && markerRef.current) {
          const latLng = [latitude, longitude];
          mapInstanceRef.current.setView(latLng, 16);
          markerRef.current.setLatLng(latLng);
          await reverseGeocode(latitude, longitude);
        }
      },
      (error) => {
        toast.dismiss('gps-loading');
        console.error('GPS detection error', error);
        toast.error('Unable to retrieve GPS coordinates. Please select manually on map.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!isAddressModalOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!window.L) return;
      if (mapInstanceRef.current) return;

      const mapEl = document.getElementById('profile-map');
      if (!mapEl) return;

      const defaultLatLng = [6.9271, 79.8612]; // Colombo

      const map = window.L.map('profile-map', {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView(defaultLatLng, 13);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const customIcon = window.L.divIcon({
        className: 'custom-map-pin',
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2 border-[#00FF33] shadow-lg relative">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF33" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                 <div class="absolute -bottom-1 w-2 h-2 bg-slate-900 border-r border-b border-[#00FF33] rotate-45"></div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = window.L.marker(defaultLatLng, {
        draggable: true,
        icon: customIcon
      }).addTo(map);

      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        await reverseGeocode(position.lat, position.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Geocode existing values if we are editing
      if (addressForm.address && addressForm.city) {
        forwardGeocode(addressForm.address, addressForm.city, map, marker);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isAddressModalOpen]);

  const provinces = [
    'Western',
    'Central',
    'Southern',
    'Northern',
    'Eastern',
    'North Western',
    'North Central',
    'Uva',
    'Sabaragamuwa',
  ];

  // Populate profile form when user context loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    } else {
      // Redirect if not logged in
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/login');
      }
    }
  }, [user, navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      return;
    }
    await updateUserProfile(profileData);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }
    if (passwordData.newPassword.length < 6) {
      return;
    }

    try {
      const success = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      // toast is already fired in context
    }
  };

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: 'Home',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      postalCode: '',
      province: 'Western',
    });
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label || 'Home',
      firstName: addr.firstName || '',
      lastName: addr.lastName || '',
      phone: addr.phone || '',
      address: addr.address || '',
      city: addr.city || '',
      postalCode: addr.postalCode || '',
      province: addr.province || 'Western',
    });
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (
      !addressForm.firstName.trim() ||
      !addressForm.lastName.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.address.trim() ||
      !addressForm.city.trim() ||
      !addressForm.postalCode.trim()
    ) {
      return;
    }

    const currentAddresses = user.addresses ? [...user.addresses] : [];
    
    if (editingAddressId) {
      // Edit mode
      const updated = currentAddresses.map((addr) =>
        addr.id === editingAddressId
          ? { ...addr, ...addressForm }
          : addr
      );
      await updateUserProfile({ addresses: updated });
    } else {
      // Add mode
      const newAddress = {
        id: Math.random().toString(36).substring(2, 9),
        ...addressForm,
        isDefault: currentAddresses.length === 0, // default if first address
      };
      await updateUserProfile({ addresses: [...currentAddresses, newAddress] });
    }
    
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    const currentAddresses = user.addresses ? [...user.addresses] : [];
    const filtered = currentAddresses.filter((addr) => addr.id !== id);
    
    // If we deleted the default address and there are other addresses, make another one default
    if (currentAddresses.find((addr) => addr.id === id)?.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }

    await updateUserProfile({ addresses: filtered });
  };

  const handleSetDefaultAddress = async (id) => {
    const currentAddresses = user.addresses ? [...user.addresses] : [];
    const updated = currentAddresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    await updateUserProfile({ addresses: updated });
  };

  // Check if password change is disabled (e.g. if the user registered with google login)
  // Usually, mock Google logins or Google OAuth users have email matching Google but let's check
  // if password field is editable. In a real system, we might check a provider field, but since 
  // we do not have a separate provider column, Google users are seeded/created with a random password 
  // that they do not know. We will allow them to change their password if they want, but show a note 
  // that they can authenticate via Google.
  const isGoogleUser = false; // We allow local password updates for all roles

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 bg-slate-50">
        <div className="w-8 h-8 border-2 border-[#00FF33] border-b-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto px-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">My Profile</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Manage your credentials and delivery addresses</p>
      </div>

      {/* Profile Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Tabs */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all text-left border ${
              activeTab === 'account'
                ? 'bg-slate-900 text-[#00FF33] border-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.1)]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <User size={16} />
            <span>Account Details</span>
          </button>
          
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all text-left border ${
              activeTab === 'addresses'
                ? 'bg-slate-900 text-[#00FF33] border-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.1)]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MapPin size={16} />
            <span>Address Book</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="md:col-span-3">
          {activeTab === 'account' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Account Profile Card */}
              <div className="bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                  <User className="text-[#00FF33] w-5 h-5" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Personal Information</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-400 font-bold outline-none cursor-not-allowed"
                      disabled
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Your login identifier cannot be modified.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="e.g. +94771234567"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#00FF33] hover:bg-[#00CC29] text-slate-900 py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,255,51,0.15)] cursor-pointer border-none"
                  >
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Password Change Card */}
              <div className="bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                  <Lock className="text-[#00FF33] w-5 h-5" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Security & Password</h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer border-none"
                  >
                    Change Password
                  </button>
                </form>
              </div>

            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6">
              
              {/* Header and Add Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="text-[#00FF33] w-5 h-5" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Saved Addresses ({user.addresses?.length || 0})</h2>
                </div>
                <button
                  onClick={openAddAddress}
                  className="flex items-center gap-1.5 bg-[#00FF33] hover:bg-[#00CC29] text-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer border-none"
                >
                  <Plus size={14} />
                  <span>Add Address</span>
                </button>
              </div>

              {/* Address Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(!user.addresses || user.addresses.length === 0) ? (
                  <div className="col-span-full bg-white border border-slate-200/70 p-12 text-center text-slate-400">
                    <MapPin className="w-12 h-12 stroke-1 mx-auto mb-4 text-slate-300" />
                    <p className="font-black text-slate-500 uppercase text-xs tracking-widest">No Addresses Saved</p>
                    <p className="text-xs text-slate-350 mt-1">Add shipping addresses for a faster checkout checkout flow.</p>
                  </div>
                ) : (
                  user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`bg-white border p-5 relative shadow-sm hover:shadow-md transition-all ${
                        addr.isDefault ? 'border-l-4 border-l-[#00FF33] border-slate-200' : 'border-slate-200'
                      }`}
                    >
                      {/* Label badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Check size={10} />
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditAddress(addr)}
                            className="text-slate-400 hover:text-slate-700 transition-colors p-1 border-none bg-transparent cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1 border-none bg-transparent cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Address Body */}
                      <div className="space-y-1 text-xs text-slate-600 font-bold">
                        <p className="text-slate-800 font-black">{addr.firstName} {addr.lastName}</p>
                        <p className="font-semibold text-slate-450">{addr.phone}</p>
                        <p className="mt-2 text-slate-700 font-normal leading-relaxed">{addr.address}</p>
                        <p className="text-slate-700 font-semibold">{addr.city}, {addr.postalCode}</p>
                        <p className="text-slate-700 uppercase font-bold text-[10px] tracking-wide">{addr.province} Province</p>
                      </div>

                      {/* Set Default trigger */}
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="mt-4 w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-scaleIn rounded-none max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 mb-4">
              {editingAddressId ? 'Edit Saved Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              {/* Address Label */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Address Label</label>
                <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        addressForm.label === lbl
                          ? 'bg-slate-900 text-[#00FF33] border border-slate-900'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Picker Dashboard */}
              <div className="mb-4 p-3 border border-slate-200 bg-slate-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-800">Choose Location on Map</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Drag the pin to your address</p>
                      </div>
                      <button
                          type="button"
                          onClick={handleDetectLocation}
                          className="flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 text-[#00FF33] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer border-none shadow-sm"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                          Use GPS
                      </button>
                  </div>
                  
                  <div 
                      id="profile-map" 
                      className="h-40 w-full border border-slate-200 z-10 relative bg-slate-100"
                      style={{ minHeight: '160px' }}
                  ></div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Recipient First Name</label>
                  <input
                    type="text"
                    value={addressForm.firstName}
                    onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Recipient Last Name</label>
                  <input
                    type="text"
                    value={addressForm.lastName}
                    onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Contact Phone Number</label>
                <input
                  type="text"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="e.g. +94771234567"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                  required
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Street Address</label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  placeholder="e.g. No. 42, Temple Road"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                  required
                />
              </div>

              {/* City and Postal Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="e.g. Colombo"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder="e.g. 00100"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                    required
                  />
                </div>
              </div>

              {/* Province */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Province</label>
                <select
                  value={addressForm.province}
                  onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#00FF33] focus:bg-white font-bold"
                >
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov} Province
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-[#00FF33] hover:bg-[#00CC29] text-slate-900 border-none transition-colors cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
