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
  XCircle
} from 'lucide-react';
import vmsLogo from '../assets/VMS logo.png';

const DeliveryDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [riderUser, setRiderUser] = useState(null);
    const [activeTab, setActiveTab] = useState('pickup'); // 'pickup' or 'active'

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
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-auto">
                        <img src={vmsLogo} alt="VMS Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-widest uppercase text-white flex items-center gap-2">
                            <span>VMS Logistics</span>
                            <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">Rider Portal</span>
                        </h1>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Agent: {riderUser.name}</p>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 rounded-xl transition-all cursor-pointer border-none p-2 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider gap-1.5"
                >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="hidden sm:inline">Exit</span>
                </button>
            </header>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 gap-2">
                <button 
                    onClick={() => setActiveTab('pickup')}
                    className={`flex-1 py-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 border-none ${
                        activeTab === 'pickup' 
                            ? 'bg-green-500/10 text-green-400 font-extrabold shadow-sm shadow-green-500/5' 
                            : 'bg-transparent text-slate-500 hover:text-slate-300 font-medium'
                    }`}
                >
                    <span className="hidden sm:inline">Available Pickups</span>
                    <span className="inline sm:hidden">Pickups</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[9px] font-bold">
                        {getReadyOrders().length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 border-none ${
                        activeTab === 'active' 
                            ? 'bg-green-500/10 text-green-400 font-extrabold shadow-sm shadow-green-500/5' 
                            : 'bg-transparent text-slate-500 hover:text-slate-300 font-medium'
                    }`}
                >
                    <span className="hidden sm:inline">On the Way</span>
                    <span className="inline sm:hidden">Active</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[9px] font-bold">
                        {getShippedOrders().length}
                    </span>
                </button>
            </div>

            {/* Content list */}
            <main className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full space-y-4 sm:space-y-6 overflow-y-auto">
                {displayedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600 text-center">
                        <Package className="w-16 h-16 stroke-1 mb-4 text-slate-800" />
                        <h3 className="font-black uppercase tracking-wider text-xs text-slate-500">No active shipments</h3>
                        <p className="text-[10px] text-slate-600 mt-1 max-w-[250px]">
                            {activeTab === 'pickup' 
                                ? 'When the supermarket admin packages an order and marks it ready, it will instantly show up here.'
                                : 'You are not currently delivering any orders. Go to available pickups to grab one!'}
                        </p>
                    </div>
                ) : (
                    displayedOrders.map(order => (
                        <div key={order.id} className="bg-slate-900 border border-slate-800/60 p-4 sm:p-5 space-y-4 hover:border-slate-750 transition-all shadow-xl rounded-2xl">
                            {/* Card Metadata */}
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                                <div className="min-w-0">
                                    <span className="font-mono text-xs font-bold text-green-400 block truncate max-w-[150px] sm:max-w-none" title={order.id}>{order.id}</span>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
                                        {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 ${
                                    order.status?.toLowerCase() === 'ready'
                                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Customer information */}
                            <div className="space-y-2 text-xs">
                                <div className="flex items-start gap-3">
                                    <User className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-white">{order.customer?.firstName} {order.customer?.lastName}</p>
                                        {activeTab === 'active' && (
                                            <div className="space-y-2 mt-2">
                                                <div className="flex gap-2">
                                                    <a 
                                                        href={`tel:${order.customer?.phone}`} 
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-700/50 cursor-pointer"
                                                    >
                                                        <Phone className="w-3 h-3 text-green-400" />
                                                        <span>Call Customer</span>
                                                    </a>
                                                </div>
                                                <p className="text-[10px] text-slate-500 truncate max-w-[220px]">{order.customer?.email}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 border-t border-slate-800/50 pt-2.5">
                                    <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-300 break-words">{order.customer?.address}</p>
                                        <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">{order.customer?.city}, {order.customer?.province}</p>
                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${order.customer?.address}, ${order.customer?.city}, ${order.customer?.province}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 active:scale-95 text-green-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-green-500/20 cursor-pointer"
                                        >
                                            <Navigation className="w-3 h-3 text-green-400" />
                                            <span>Navigate on Map</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* COD / Payment Info */}
                            <div className={`p-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between ${
                                order.paymentMethod === 'cod'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
                            }`}>
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
                                </div>
                                <span className="text-sm font-black">{currency}{order.summary?.total}</span>
                            </div>

                            {/* Item breakdown */}
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 text-xs space-y-2">
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-900 pb-1.5">Verification Checklist</p>
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400 font-semibold truncate max-w-[170px] sm:max-w-[220px]">{item.name}</span>
                                        <span className="text-slate-500 font-black">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2">
                                {activeTab === 'pickup' ? (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                                        className="w-full bg-green-500 hover:bg-green-400 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all border-none"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Accept Delivery Request</span>
                                    </button>
                                ) : (
                                    <>
                                        {order.status?.toLowerCase() === 'accepted' ? (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                                className="w-full bg-green-500 hover:bg-green-400 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all border-none"
                                            >
                                                <Navigation className="w-4 h-4" />
                                                <span>Pick Up & Start Route</span>
                                            </button>
                                        ) : (
                                            <div className="flex gap-2.5">
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                    className="flex-1 bg-transparent hover:bg-red-500/10 border border-red-500/20 text-red-500 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
                                                >
                                                    <XCircle className="w-4 h-4 flex-shrink-0" />
                                                    <span>Cancel</span>
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                    className="flex-[1.5] bg-green-500 hover:bg-green-400 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all border-none"
                                                >
                                                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                                    <span className="hidden sm:inline">Deliver Order</span>
                                                    <span className="inline sm:hidden">Deliver</span>
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
