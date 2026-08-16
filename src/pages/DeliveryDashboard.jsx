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
        <div className="min-h-screen bg-[#121212] text-[#f5f5f5] font-sans flex flex-col antialiased">
            {/* Premium Header */}
            <header className="bg-[#171717] border-b border-[#262626] px-6 py-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-auto hover:rotate-6 transition-transform duration-300">
                        <img src={vmsLogo} alt="VMS Logo" className="w-full h-full object-contain brightness-110" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-[0.25em] uppercase text-white flex items-center gap-2">
                            <span>VMS LOGISTICS</span>
                            <span className="bg-[#00FF33]/15 text-[#00FF33] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">RIDER PORTAL</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Agent: <span className="text-slate-350">{riderUser.name}</span></p>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-none border border-red-500/30 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] active:scale-95"
                >
                    <LogOut className="w-3.5 h-3.5 text-red-500 mr-2" />
                    <span>Exit Session</span>
                </button>
            </header>

            {/* Premium Minimal Navigation Tabs */}
            <div className="flex border-b border-[#262626] bg-[#171717]/60 p-3 gap-3">
                <button 
                    onClick={() => setActiveTab('pickup')}
                    className={`flex-1 py-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer rounded-none flex items-center justify-center gap-2.5 border-2 ${
                        activeTab === 'pickup' 
                            ? 'bg-[#00FF33]/10 text-[#00FF33] border-[#00FF33] font-black shadow-[0_0_15px_rgba(0,255,51,0.15)]' 
                            : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300 font-bold'
                    }`}
                >
                    <span>AVAILABLE PICKUPS</span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 text-[10px] font-black border border-slate-800 text-white">
                        {getReadyOrders().length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer rounded-none flex items-center justify-center gap-2.5 border-2 ${
                        activeTab === 'active' 
                            ? 'bg-[#00FF33]/10 text-[#00FF33] border-[#00FF33] font-black shadow-[0_0_15px_rgba(0,255,51,0.15)]' 
                            : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300 font-bold'
                    }`}
                >
                    <span>ON THE WAY</span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 text-[10px] font-black border border-slate-800 text-white">
                        {getShippedOrders().length}
                    </span>
                </button>
            </div>

            {/* Content List */}
            <main className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full space-y-6 overflow-y-auto">
                {displayedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-600 text-center bg-[#171717] border border-[#262626] p-6 shadow-xl">
                        <Package className="w-16 h-16 stroke-[1.5] mb-4 text-slate-500 animate-pulse" />
                        <h3 className="font-black uppercase tracking-[0.2em] text-xs text-white">No Active Shipments</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-2.5 max-w-[280px] leading-relaxed">
                            {activeTab === 'pickup' 
                                ? 'When the supermarket admin packages an order and marks it ready, it will instantly show up here.'
                                : 'You are not currently delivering any orders. Go to available pickups to grab one!'}
                        </p>
                    </div>
                ) : (
                    displayedOrders.map(order => (
                        <div key={order.id} className="bg-[#171717] border border-[#262626] p-5 sm:p-6 space-y-5 hover:border-slate-700 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative">
                            {/* Card Header & Status */}
                            <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
                                <div className="min-w-0">
                                    <span className="font-mono text-xs font-black text-[#00FF33] block truncate max-w-[150px] sm:max-w-none uppercase tracking-widest">{order.id}</span>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
                                        Received: {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${
                                    order.status?.toLowerCase() === 'ready'
                                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Customer & Destination details */}
                            <div className="space-y-3.5 text-xs">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-800">
                                        <User className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Customer</p>
                                        <p className="font-bold text-white text-xs mt-0.5">{order.customer?.firstName} {order.customer?.lastName}</p>
                                        {activeTab === 'active' && (
                                            <div className="mt-2.5 flex items-center gap-2">
                                                <a 
                                                    href={`tel:${order.customer?.phone}`} 
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-green-500 hover:text-white transition-all text-slate-300 font-black uppercase tracking-widest text-[9px] cursor-pointer"
                                                >
                                                    <Phone className="w-3 h-3 text-[#00FF33]" />
                                                    <span>Call Customer</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 border-t border-[#262626] pt-3.5">
                                    <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-800">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Delivery Address</p>
                                        <p className="font-bold text-slate-200 mt-0.5 leading-relaxed">{order.customer?.address}</p>
                                        <p className="text-[9px] text-[#00FF33] font-black tracking-widest uppercase mt-1">{order.customer?.city}, {order.customer?.province}</p>
                                        
                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${order.customer?.address}, ${order.customer?.city}, ${order.customer?.province}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-[#00FF33] hover:bg-[#00FF33]/85 text-slate-950 hover:scale-[1.03] transition-all font-black uppercase tracking-widest text-[9px] cursor-pointer border-none"
                                        >
                                            <Navigation className="w-3 h-3" />
                                            <span>Navigate on Map</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Payment details block */}
                            <div className={`p-4 text-xs font-black uppercase tracking-[0.15em] flex items-center justify-between border ${
                                order.paymentMethod === 'cod'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-green-500/10 text-[#00FF33] border-[#00FF33]/20'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
                                </div>
                                <span className="text-sm font-black">{currency}{order.summary?.total}</span>
                            </div>

                            {/* Verification List / Items */}
                            <div className="bg-slate-950/40 p-4 border border-slate-900/60 text-xs space-y-3.5">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] border-b border-slate-900 pb-2">Verification Checklist</p>
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[10px] tracking-wide">
                                        <span className="text-slate-400 font-bold truncate max-w-[170px] sm:max-w-[220px]">{item.name}</span>
                                        <span className="text-[#00FF33] font-black">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Workflow Actions */}
                            <div className="pt-2 border-t border-[#262626]">
                                {activeTab === 'pickup' ? (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                                        className="w-full bg-[#00FF33] hover:bg-[#00FF33]/85 text-slate-950 font-black text-[10px] uppercase tracking-[0.25em] py-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
                                    >
                                        Accept Delivery Request
                                    </button>
                                ) : (
                                    <>
                                        {order.status?.toLowerCase() === 'accepted' ? (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                                className="w-full bg-[#00FF33] hover:bg-[#00FF33]/85 text-slate-950 font-black text-[10px] uppercase tracking-[0.25em] py-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
                                            >
                                                Pick Up & Start Route
                                            </button>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                    className="flex-1 bg-transparent hover:bg-red-500/10 border border-red-500/30 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] py-4 cursor-pointer transition-all hover:scale-[1.02]"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                    className="flex-[1.5] bg-[#00FF33] hover:bg-[#00FF33]/85 text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] py-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
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
