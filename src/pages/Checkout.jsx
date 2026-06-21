import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MapPin, CreditCard, Wallet, Check, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { cartItems, products, currency, setCartItems, checkout, user, refreshProducts, updateUserProfile } = useAppContext();
    const navigate = useNavigate();
    const [cartData, setCartData] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [saveAddressToBook, setSaveAddressToBook] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(!!window.L);

    const mapInstanceRef = React.useRef(null);
    const markerRef = React.useRef(null);

    // Poll to check when Leaflet script is fully loaded and available on window
    useEffect(() => {
        if (window.L) {
            setLeafletLoaded(true);
            return;
        }
        const interval = setInterval(() => {
            if (window.L) {
                setLeafletLoaded(true);
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        refreshProducts();
    }, []);

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

                // Auto-fill form fields
                const road = addr.road || addr.suburb || addr.neighbourhood || '';
                const village = addr.village || addr.suburb || addr.town || '';
                const streetAddress = road ? `${road}${village ? ', ' + village : ''}` : (data.display_name || '');

                setFormData((prev) => ({
                    ...prev,
                    address: streetAddress,
                    city: addr.city || addr.town || addr.village || addr.suburb || '',
                    postalCode: addr.postcode || '',
                    province: matchedProvince || prev.province || ''
                }));
                
                toast.success('Address auto-filled from map!');
            }
        } catch (err) {
            console.error('Failed to reverse geocode', err);
        }
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }

        toast.loading('Detecting your GPS location...', { id: 'gps-loading' });

        const options = { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 };

        const successCallback = async (position) => {
            const { latitude, longitude } = position.coords;
            toast.dismiss('gps-loading');
            toast.success('Live location detected!');

            if (mapInstanceRef.current && markerRef.current) {
                const latLng = [latitude, longitude];
                mapInstanceRef.current.setView(latLng, 16);
                markerRef.current.setLatLng(latLng);
                await reverseGeocode(latitude, longitude);
            }
        };

        const errorCallback = (error) => {
            // If high accuracy GPS timed out, fallback to low accuracy cellular/wifi geolocation
            if (error.code === error.TIMEOUT && options.enableHighAccuracy) {
                options.enableHighAccuracy = false;
                options.timeout = 10000;
                navigator.geolocation.getCurrentPosition(successCallback, finalErrorCallback, options);
            } else {
                finalErrorCallback(error);
            }
        };

        const finalErrorCallback = (error) => {
            toast.dismiss('gps-loading');
            console.error('GPS detection error', error);
            if (error.code === error.PERMISSION_DENIED) {
                toast.error('Location permission denied. Please allow location access in your browser settings.');
            } else {
                toast.error('Unable to retrieve GPS location. Please select manually on map.');
            }
        };

        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    };

    useEffect(() => {
        // If Leaflet is not loaded from CDN yet, wait
        if (!leafletLoaded || !window.L) return;

        if (!mapInstanceRef.current && document.getElementById('checkout-map')) {
            const defaultLatLng = [6.9271, 79.8612]; // Colombo
            
            const map = window.L.map('checkout-map', {
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

            // Invalidate size to correctly render map tiles and prevent grey/blank map issues
            setTimeout(() => {
                map.invalidateSize();
            }, 250);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [leafletLoaded]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        province: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                postalCode: user.postalCode || '',
                province: user.province || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const tempData = [];
        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                const product = products.find(p => p.id === parseInt(itemId));
                if (product) {
                    tempData.push({
                        ...product,
                        quantity: cartItems[itemId]
                    });
                }
            }
        }
        setCartData(tempData);
    }, [cartItems, products]);

    const getCartTotal = () => {
        return cartData.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartDiscount = () => {
        return cartData.reduce((total, item) => {
            const disc = item.oldPrice > item.price ? (item.oldPrice - item.price) : 0;
            return total + (disc * item.quantity);
        }, 0);
    };

    const getCartItemBatchBreakdown = (item) => {
        if (!item.batches || item.batches.length === 0) return [];
        let remaining = item.quantity;
        const breakdown = [];
        for (const batch of item.batches) {
            if (remaining <= 0) break;
            const taken = Math.min(remaining, batch.quantity);
            if (taken > 0) {
                breakdown.push({
                    batchNumber: batch.batchNumber,
                    quantity: taken,
                    sellingPrice: batch.sellingPrice
                });
                remaining -= taken;
            }
        }
        return breakdown;
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        // Validation
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'province'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            // Save address to book if checked
            if (user && saveAddressToBook) {
                const currentAddresses = user.addresses || [];
                const exists = currentAddresses.some(addr => 
                    addr.address.toLowerCase().trim() === formData.address.toLowerCase().trim() && 
                    addr.city.toLowerCase().trim() === formData.city.toLowerCase().trim()
                );
                
                if (!exists) {
                    const newAddress = {
                        id: Math.random().toString(36).substring(2, 9),
                        label: 'Home',
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        postalCode: formData.postalCode,
                        province: formData.province,
                        isDefault: currentAddresses.length === 0
                    };
                    await updateUserProfile({ addresses: [...currentAddresses, newAddress] });
                }
            }

            const order = await checkout(formData, paymentMethod);
            setCartItems({});
            navigate('/');
        } catch (err) {
            // checkout will show toast on error
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartData.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
                <Package size={80} className="text-gray-300 mb-6" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Add items to checkout</p>
                <button
                    onClick={() => navigate('/all-products')}
                    className="bg-[#00FF33] hover:bg-[#00CC29] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                    Shop Now
                </button>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[#00FF33] rounded-full flex items-center justify-center">
                                    <MapPin size={20} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Shipping Address</h2>
                            </div>

                            {/* Saved Address Selector */}
                            {user && user.addresses && user.addresses.length > 0 && (
                                <div className="mb-6 p-4 bg-slate-50 border border-slate-200">
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Choose from saved addresses</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {user.addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => {
                                                    setFormData({
                                                        firstName: addr.firstName,
                                                        lastName: addr.lastName,
                                                        email: user.email,
                                                        phone: addr.phone,
                                                        address: addr.address,
                                                        city: addr.city,
                                                        postalCode: addr.postalCode,
                                                        province: addr.province
                                                    });
                                                }}
                                                className={`cursor-pointer p-4 bg-white border transition-all hover:border-[#00FF33] text-left relative ${
                                                    formData.address === addr.address && formData.city === addr.city
                                                        ? 'border-l-4 border-l-[#00FF33] border-slate-900 shadow-sm'
                                                        : 'border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <span className="bg-slate-900 text-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                                        {addr.label}
                                                    </span>
                                                    {addr.isDefault && (
                                                        <span className="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-black text-slate-800">{addr.firstName} {addr.lastName}</p>
                                                <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">{addr.phone}</p>
                                                <p className="text-[11px] text-slate-755 mt-1 truncate">{addr.address}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{addr.city}, {addr.province}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({
                                                    firstName: '',
                                                    lastName: '',
                                                    email: user.email || '',
                                                    phone: '',
                                                    address: '',
                                                    city: '',
                                                    postalCode: '',
                                                    province: ''
                                                });
                                            }}
                                            className="text-xs font-black uppercase tracking-widest text-[#00FF33] hover:text-[#00CC29] bg-transparent border-none cursor-pointer"
                                        >
                                            + Enter New Address
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Map Picker Dashboard */}
                            <div className="mb-6 p-4 border border-slate-200/80 bg-slate-50/50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-800">Choose Location on Map</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Drag the pin to your delivery address</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDetectLocation}
                                        className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-[#00FF33] px-3.5 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer border-none shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                                        Use Live GPS Location
                                    </button>
                                </div>
                                
                                <div 
                                    id="checkout-map" 
                                    className="h-60 w-full border border-slate-200 z-10 relative bg-slate-100"
                                    style={{ minHeight: '240px' }}
                                ></div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                                            placeholder="John"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                                            placeholder="+94 71 234 5678"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                                        placeholder="123 Main Street"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                                            placeholder="Colombo"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                                            placeholder="10100"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                                        <select
                                            name="province"
                                            value={formData.province}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                                            required
                                        >
                                            <option value="">Select</option>
                                            <option value="Western">Western</option>
                                            <option value="Central">Central</option>
                                            <option value="Southern">Southern</option>
                                            <option value="Northern">Northern</option>
                                            <option value="Eastern">Eastern</option>
                                            <option value="North Western">North Western</option>
                                            <option value="North Central">North Central</option>
                                            <option value="Uva">Uva</option>
                                            <option value="Sabaragamuwa">Sabaragamuwa</option>
                                        </select>
                                    </div>
                                </div>

                                {user && (
                                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-100">
                                        <input
                                            type="checkbox"
                                            id="saveAddressToBook"
                                            checked={saveAddressToBook}
                                            onChange={(e) => setSaveAddressToBook(e.target.checked)}
                                            className="w-4 h-4 text-[#00FF33] border-gray-300 rounded focus:ring-[#00FF33] cursor-pointer"
                                        />
                                        <label htmlFor="saveAddressToBook" className="text-xs text-gray-600 font-bold select-none cursor-pointer uppercase tracking-tight">
                                            Save this address to my Address Book for future checkouts
                                        </label>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[#00FF33] rounded-full flex items-center justify-center">
                                    <CreditCard size={20} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
                            </div>

                            <div className="space-y-3">
                                <div
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#00FF33] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Wallet size={24} className="text-gray-600" />
                                        <div>
                                            <p className="font-semibold text-gray-800">Cash on Delivery</p>
                                            <p className="text-sm text-gray-500">Pay when you receive</p>
                                        </div>
                                    </div>
                                    {paymentMethod === 'cod' && (
                                        <div className="w-6 h-6 bg-[#00FF33] rounded-full flex items-center justify-center">
                                            <Check size={16} className="text-white" />
                                        </div>
                                    )}
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('card')}
                                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#00FF33] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={24} className="text-gray-600" />
                                        <div>
                                            <p className="font-semibold text-gray-800">Credit/Debit Card</p>
                                            <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                                        </div>
                                    </div>
                                    {paymentMethod === 'card' && (
                                        <div className="w-6 h-6 bg-[#00FF33] rounded-full flex items-center justify-center">
                                            <Check size={16} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

                            {/* Products */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {cartData.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{item.name}</h4>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-bold text-gray-900">{currency}{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Details */}
                            <div className="space-y-3 mb-6 pt-6 border-t border-gray-200">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartData.length} items)</span>
                                    <span className="font-semibold">{currency}{getCartTotal() + getCartDiscount()}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span className="font-semibold">
                                        {getCartDiscount() > 0 ? `-${currency}${getCartDiscount()}` : `${currency}0`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-green-600">FREE</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <div className="flex justify-between text-lg font-bold text-gray-800">
                                        <span>Total</span>
                                        <span className="text-2xl text-[#00FF33]">{currency}{getCartTotal()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full bg-[#00FF33] hover:bg-[#00CC29] text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : 'Place Order'}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                By placing your order, you agree to our terms and conditions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;