import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  User, 
  Package, 
  MapPin, 
  Phone, 
  LogOut, 
  Navigation, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  HelpCircle,
  Gift,
  FileText,
  Sparkles
} from 'lucide-react';
import vmsLogo from '../assets/VMS logo.png';
import profileIcon from '../assets/man.png';

const DeliveryDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [riderUser, setRiderUser] = useState(null);
    const [activeTab, setActiveTab] = useState('pickup'); // 'pickup' or 'active'
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const currency = "Rs.";

    // Check auth on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('vms_rider_user');
        const token = localStorage.getItem('vms_rider_token');
        if (savedUser && token) {
            setRiderUser(JSON.parse(savedUser));
            setLoading(false);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchDeliveryOrders = async () => {
        try {
            const token = localStorage.getItem('vms_rider_token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/delivery`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (e) {
            console.error('Error fetching delivery orders:', e);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('vms_rider_token');
        localStorage.removeItem('vms_rider_user');
        setRiderUser(null);
        setOrders([]);
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const playBeep = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(660, audioCtx.currentTime); // E5 note
            gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
            oscillator.stop(audioCtx.currentTime + 0.35);
        } catch (e) {
            console.warn('AudioContext sound blocked:', e);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem('vms_rider_token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!res.ok) {
                throw new Error('Failed to update status');
            }

            toast.success(`Order advanced to: ${status.toUpperCase()}`);
            fetchDeliveryOrders();
        } catch (e) {
            toast.error(e.message || 'Error updating status');
        }
    };

    // Load active delivery orders and listen to socket updates
    useEffect(() => {
        if (!riderUser) return;

        fetchDeliveryOrders();

        const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const socket = io(socketUrl);

        socket.on('connect', () => {
            console.log('Connected to order WebSockets (Rider)');
        });

        socket.on('order:status-update', (data) => {
            const { status } = data;
            // Play notification chime specifically when a new order becomes 'ready' for pickup
            if (status?.toLowerCase() === 'ready') {
                playBeep();
                toast.success('A new order is ready for pickup!', { duration: 5000 });
            }
            fetchDeliveryOrders();
        });

        socket.on('order:new', () => {
            fetchDeliveryOrders();
        });

        return () => {
            socket.disconnect();
        };
    }, [riderUser]);

    const getReadyOrders = () => orders.filter(o => o.status?.toLowerCase() === 'dispatched');
    const getShippedOrders = () => orders.filter(o => ['accepted', 'shipped'].includes(o.status?.toLowerCase()));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400">
                <div className="w-8 h-8 border-2 border-green-500 border-b-transparent rounded-full animate-spin mb-4"></div>
                <span className="font-bold text-xs tracking-wider uppercase">Connecting to Rider Portal...</span>
            </div>
        );
    }

    // Auth screen
    if (!riderUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400">
                <div className="w-8 h-8 border-2 border-green-500 border-b-transparent rounded-full animate-spin mb-4"></div>
                <span className="font-bold text-xs tracking-wider uppercase">Redirecting to login...</span>
            </div>
        );
    }

    const displayedOrders = activeTab === 'pickup' ? getReadyOrders() : getShippedOrders();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased relative">
            
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
                {/* Top Left Avatar (Opens PickMe menu) */}
                <button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-500 hover:scale-105 active:scale-95 transition-all cursor-pointer bg-slate-100 flex-shrink-0"
                >
                    <img src={profileIcon} className="w-full h-full object-cover" alt="Profile" />
                </button>

                {/* PickMe Style Center Earnings Pill */}
                <div className="bg-slate-900 text-white px-5 py-1.5 rounded-full shadow flex items-center gap-2 border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">LKR</span>
                    <span className="text-sm font-mono font-black text-white">0.00</span>
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Today</span>
                </div>

                {/* Right Side Refresh Icon / Logo */}
                <div className="w-10 h-auto flex items-center justify-end">
                    <img src={vmsLogo} alt="VMS Logo" className="h-6 w-auto object-contain" />
                </div>
            </header>

            {/* Left Slide-out Profile Drawer (PickMe Driver Style) */}
            {isDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/60 z-50 backdrop-blur-xs flex animate-fadeIn"
                    onClick={() => setIsDrawerOpen(false)}
                >
                    <div 
                        className="w-80 h-full bg-white shadow-2xl flex flex-col animate-slideInLeft"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer Header (Orange Gradient with logout icon) */}
                        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white p-6 pt-12 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none"></div>
                            <div className="flex items-center gap-3.5 z-10">
                                <img src={profileIcon} className="w-14 h-14 rounded-full border-2 border-white shadow bg-white" alt="Profile" />
                                <div>
                                    <h3 className="font-extrabold text-sm tracking-tight text-white">{riderUser.name}</h3>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer border-none shadow-sm active:scale-95 z-10"
                                title="Exit Session"
                            >
                                <LogOut className="w-4.5 h-4.5 text-white" />
                            </button>
                        </div>

                        {/* Drawer Menu Items (PickMe List style) */}
                        <div className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
                            {[
                                { label: 'Profile', icon: <User className="w-5 h-5 text-slate-500" /> },
                                { label: 'Earnings', icon: <DollarSign className="w-5 h-5 text-slate-500" /> },
                                { label: 'Logout', icon: <LogOut className="w-5 h-5 text-slate-500" />, action: handleLogout },
                            ].map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors rounded-xl"
                                    onClick={() => {
                                        setIsDrawerOpen(false);
                                        if (item.action) item.action();
                                    }}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs (Minimal Light Mode) */}
            <div className="flex border-b border-slate-200 bg-white p-2.5 gap-2 shadow-sm">
                <button 
                    onClick={() => setActiveTab('pickup')}
                    className={`flex-1 py-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 border-none ${
                        activeTab === 'pickup' 
                            ? 'bg-green-500/10 text-green-700 font-extrabold shadow-sm' 
                            : 'bg-transparent text-slate-400 hover:text-slate-600 font-medium'
                    }`}
                >
                    <span>AVAILABLE PICKUPS</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black border border-slate-200 text-slate-700">
                        {getReadyOrders().length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 border-none ${
                        activeTab === 'active' 
                            ? 'bg-green-500/10 text-green-700 font-extrabold shadow-sm' 
                            : 'bg-transparent text-slate-400 hover:text-slate-600 font-medium'
                    }`}
                >
                    <span>ON THE WAY</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black border border-slate-200 text-slate-700">
                        {getShippedOrders().length}
                    </span>
                </button>
            </div>

            {/* Content List */}
            <main className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full space-y-5 overflow-y-auto">
                {displayedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
                        <Package className="w-14 h-14 stroke-1.5 mb-3.5 text-slate-300 animate-bounce" />
                        <h3 className="font-black uppercase tracking-widest text-xs text-slate-700">No Active Shipments</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-2 max-w-[260px] leading-relaxed">
                            {activeTab === 'pickup' 
                                ? 'When the supermarket admin packages an order and marks it ready, it will instantly show up here.'
                                : 'You are not currently delivering any orders. Go to available pickups to grab one!'}
                        </p>
                    </div>
                ) : (
                    displayedOrders.map(order => (
                        <div key={order.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4">
                            {/* Card Header & Status */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="min-w-0">
                                    <span className="font-mono text-xs font-black text-slate-800 block truncate max-w-[150px] sm:max-w-none uppercase tracking-widest">{order.id}</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                                        Received: {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded ${
                                    order.status?.toLowerCase() === 'ready'
                                        ? 'bg-teal-50 text-teal-600 border border-teal-100'
                                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                                }`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Customer & Destination Details */}
                            <div className="space-y-3 text-xs">
                                <div className="flex items-start gap-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-xs">
                                        <User className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Customer</p>
                                        <p className="font-black text-slate-700 text-xs mt-0.5">{order.customer?.firstName} {order.customer?.lastName}</p>
                                        {activeTab === 'active' && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <a 
                                                    href={`tel:${order.customer?.phone}`} 
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-green-500 hover:text-green-600 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                                                >
                                                    <Phone className="w-3.5 h-3.5 text-green-500" />
                                                    <span>Call Customer</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-xs">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Delivery Address</p>
                                        <p className="font-bold text-slate-700 mt-0.5 leading-relaxed text-xs">{order.customer?.address}</p>
                                        <p className="text-[9px] text-green-600 font-black tracking-widest uppercase mt-1">{order.customer?.city}, {order.customer?.province}</p>
                                        
                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${order.customer?.address}, ${order.customer?.city}, ${order.customer?.province}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-black uppercase tracking-widest text-[9px] cursor-pointer shadow-sm hover:scale-[1.03] transition-all border-none"
                                        >
                                            <Navigation className="w-3.5 h-3.5" />
                                            <span>Navigate on Map</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Payment details block */}
                            <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-between border ${
                                order.paymentMethod === 'cod'
                                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                                    : 'bg-green-50 text-green-600 border-green-100'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
                                </div>
                                <span className="text-sm font-black">{currency}{order.summary?.total}</span>
                            </div>

                            {/* Verification List / Items */}
                            <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl text-xs space-y-2.5">
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider border-b border-slate-100 pb-1.5">Verification Checklist</p>
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[10px] tracking-wide">
                                        <span className="text-slate-600 font-bold truncate max-w-[170px] sm:max-w-[220px]">{item.name}</span>
                                        <span className="text-slate-800 font-black">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Workflow Actions */}
                            <div className="pt-2">
                                {activeTab === 'pickup' ? (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all border-none shadow-sm"
                                    >
                                        Accept Delivery Request
                                    </button>
                                ) : (
                                    <>
                                        {order.status?.toLowerCase() === 'accepted' ? (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                                className="w-full bg-green-500 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all border-none shadow-sm"
                                            >
                                                Pick Up & Start Route
                                            </button>
                                        ) : (
                                            <div className="flex gap-2.5">
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                    className="flex-1 bg-transparent hover:bg-red-50 hover:text-white border border-red-200 text-red-500 font-black text-xs uppercase tracking-widest py-3.5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                    className="flex-[1.5] bg-green-500 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all border-none shadow-sm"
                                                >
                                                    Deliver Order
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default DeliveryDashboard;
