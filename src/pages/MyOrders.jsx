import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, MapPin, Calendar, CreditCard, ChevronRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const MyOrders = () => {
    const { user, products, currency, navigate } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [highlightedOrders, setHighlightedOrders] = useState({});

    useEffect(() => {
        if (!user) return;

        const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const socket = io(socketUrl);

        socket.on('connect', () => {
            console.log('Connected to order WebSockets (Customer)');
        });

        socket.on('order:status-update', (data) => {
            const { orderId, status } = data;
            
            setOrders((prevOrders) => {
                const orderExists = prevOrders.some(o => o.id === orderId);
                if (!orderExists) return prevOrders;

                try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
                    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
                    oscillator.start();
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                    oscillator.stop(audioCtx.currentTime + 0.3);
                } catch (e) {
                    console.warn('AudioContext sound blocked:', e);
                }

                toast.success(`Your order status is updated to ${status.toUpperCase()}!`, {
                    duration: 6000,
                    position: 'bottom-right'
                });

                setHighlightedOrders(prev => ({
                    ...prev,
                    [orderId]: true
                }));

                setTimeout(() => {
                    setHighlightedOrders(prev => {
                        const copy = { ...prev };
                        delete copy[orderId];
                        return copy;
                    });
                }, 5000);

                return prevOrders.map(o => o.id === orderId ? { ...o, status } : o);
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${user.id}/orders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await res.json();
                // Sort by date descending
                const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sorted);
            } catch (err) {
                toast.error(err.message || 'Error loading orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'placed':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'ready':
                return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'shipped':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'delivered':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getProductImage = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.image : null;
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 bg-gray-50">
                <div className="w-12 h-12 border-4 border-t-[#00FF33] border-gray-200 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Retrieving your order logs...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center py-16 px-4 bg-gray-50">
                <div className="bg-white p-8 md:p-12 shadow-md max-w-md w-full border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-slate-900 text-[#00FF33] flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <h2 className="text-2xl font-black uppercase text-gray-800 mb-3 tracking-tight">Access Restricted</h2>
                    <p className="text-gray-500 text-sm mb-8">Please log in to your VMS Super Mart customer account to view your past purchases and track active deliveries.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-[#00FF33] hover:bg-[#00CC29] text-white py-4 font-black uppercase tracking-wider text-xs transition duration-300 shadow-[0_4px_15px_rgba(0,255,51,0.15)] border-none cursor-pointer"
                    >
                        Sign In Now
                    </button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center py-16 px-4 bg-gray-50">
                <div className="text-center max-w-md bg-white p-8 md:p-12 border border-gray-100 shadow-md">
                    <div className="w-20 h-20 bg-gray-150 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                        <Package size={36} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
                    <p className="text-gray-500 mb-8">It looks like you haven't placed any orders yet. Discover our premium products and fill up your cart!</p>
                    <button
                        onClick={() => navigate('/all-products')}
                        className="bg-[#00FF33] hover:bg-[#00CC29] text-white px-8 py-4 font-black uppercase tracking-wider text-xs transition duration-300 shadow-[0_4px_15px_rgba(0,255,51,0.15)] border-none cursor-pointer"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">My Orders</h1>
                        <p className="text-sm text-gray-500 mt-1">Track and manage your order history</p>
                    </div>
                    <div className="mt-4 md:mt-0 bg-slate-900 text-white px-4 py-2 text-xs font-black uppercase tracking-wider border-l-4 border-[#00FF33]">
                        Active Customer Profile
                    </div>
                </div>

                <div className="space-y-6">
                    {orders.map((order) => {
                        const isHighlighted = highlightedOrders[order.id];
                        return (
                            <div 
                                key={order.id} 
                                className={`bg-white border shadow-sm overflow-hidden hover:shadow-md transition-all duration-500 ${
                                    isHighlighted 
                                        ? 'border-green-500 ring-2 ring-green-400 ring-opacity-50 scale-[1.01] animate-pulse' 
                                        : 'border-gray-200'
                                }`}
                            >
                            {/* Order Header */}
                            <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="grid grid-cols-2 md:flex md:items-center gap-x-8 gap-y-2">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order ID</p>
                                        <p className="text-sm font-black text-[#00FF33]">{order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date Placed</p>
                                        <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Value</p>
                                        <p className="text-sm font-bold text-[#00FF33]">{currency || 'Rs.'}{order.summary?.total || 0}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-xs font-semibold capitalize border rounded-full ${getStatusStyle(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6 divide-y divide-gray-100">
                                {order.items?.map((item) => {
                                    const img = getProductImage(item.productId);
                                    return (
                                        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {img ? (
                                                        <img src={img} alt={item.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <Package className="text-gray-300" size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-1">{item.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity} × {currency || 'Rs.'}{item.price}</p>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-sm font-bold text-gray-900">{currency || 'Rs.'}{item.total}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Order Summary & Shipping */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={12} /> Shipping Destination</p>
                                    <p className="text-gray-800 font-semibold">{order.customer?.firstName} {order.customer?.lastName}</p>
                                    <p className="text-gray-600">{order.customer?.address}, {order.customer?.city}, {order.customer?.province} ({order.customer?.postalCode})</p>
                                </div>
                                <div className="flex flex-col md:items-end justify-center">
                                    <div className="space-y-1 w-full md:w-48">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Subtotal:</span>
                                            <span>{currency || 'Rs.'}{order.summary?.subtotal || 0}</span>
                                        </div>
                                        {Math.abs(order.summary?.discount || 0) > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount:</span>
                                                <span>-{currency || 'Rs.'}{Math.abs(order.summary?.discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-gray-500">
                                            <span>Shipping:</span>
                                            <span className="text-green-600">FREE</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-gray-800 pt-1 border-t border-gray-200">
                                            <span>Total paid:</span>
                                            <span className="text-[#00CC29]">{currency || 'Rs.'}{order.summary?.total || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
