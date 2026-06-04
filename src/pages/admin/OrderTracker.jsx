import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Clock, User, Package, MapPin, ArrowRight } from 'lucide-react';

const OrderTracker = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const currency = "Rs.";

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('vms_admin_token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setOrders(data);
        } catch (e) {
            console.error('Error fetching orders:', e);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, nextStatus) => {
        try {
            const token = localStorage.getItem('vms_admin_token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });

            if (!res.ok) {
                throw new Error('Failed to update status');
            }

            toast.success(`Order advanced to ${nextStatus.toUpperCase()}`);
            fetchOrders();
        } catch (e) {
            toast.error(e.message || 'Error updating order status');
        }
    };

    const playBeep = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            oscillator.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
            console.warn('AudioContext sound blocked:', e);
        }
    };

    useEffect(() => {
        fetchOrders();

        const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const socket = io(socketUrl);

        socket.on('connect', () => {
            console.log('Connected to order WebSockets (Tracker Dashboard)');
        });

        socket.on('order:new', (newOrder) => {
            playBeep();
            toast.success(`New order received! Order ID: ${newOrder.id}`, {
                duration: 5000,
                position: 'top-right',
            });
            fetchOrders();
        });

        socket.on('order:status-update', () => {
            fetchOrders();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Filter active tracking orders (placed, preparing, ready, shipped)
    const columns = {
        placed: { title: 'New / Placed', color: 'border-blue-500 bg-blue-500/10 text-blue-700', nextStatus: 'preparing', actionText: 'Start Packing' },
        preparing: { title: 'Preparing / Packing', color: 'border-purple-500 bg-purple-500/10 text-purple-700', nextStatus: 'ready', actionText: 'Mark Ready' },
        ready: { title: 'Ready to Dispatch', color: 'border-teal-500 bg-teal-500/10 text-teal-700', nextStatus: 'shipped', actionText: 'Ship / Out' },
        shipped: { title: 'Shipped / Out', color: 'border-amber-500 bg-amber-500/10 text-amber-700', nextStatus: 'delivered', actionText: 'Mark Delivered' },
    };

    const getTimeElapsed = (createdAt) => {
        const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000); // in minutes
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${hours}h ${mins}m ago`;
    };

    const getColumnOrders = (statusKey) => {
        return orders.filter(o => o.status?.toLowerCase() === statusKey);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] gap-2">
                <div className="w-6 h-6 border-2 border-green-500 border-b-transparent rounded-full animate-spin"></div>
                <span className="font-semibold text-xs tracking-wider uppercase text-slate-400">Loading Order Tracker...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Order Tracker</h1>
                <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Monitor and process client order fulfillment pipelines</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(columns).map(([statusKey, col]) => {
                    const colOrders = getColumnOrders(statusKey);
                    return (
                        <div key={statusKey} className="flex flex-col bg-white border border-slate-200/70 rounded-none shadow-sm h-[70vh]">
                            {/* Column Header */}
                            <div className={`p-4 border-b-2 flex items-center justify-between font-bold ${col.color} border-current`}>
                                <span className="uppercase text-xs tracking-widest">{col.title}</span>
                                <span className="bg-slate-900/10 px-2 py-0.5 rounded-full text-xs font-black">{colOrders.length}</span>
                            </div>

                            {/* Column Content */}
                            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                                {colOrders.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center py-12 text-slate-300">
                                        <Package className="w-8 h-8 stroke-1 mb-2 text-slate-200" />
                                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-350">No orders</span>
                                    </div>
                                ) : (
                                    colOrders.map(order => (
                                        <div key={order.id} className="bg-white p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
                                            {/* Order metadata */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-mono text-[10px] font-black text-slate-800 tracking-tight">{order.id}</span>
                                                <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-slate-300" />
                                                    {getTimeElapsed(order.createdAt)}
                                                </span>
                                            </div>

                                            {/* Customer name */}
                                            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                                                <User className="w-3.5 h-3.5 text-slate-300" />
                                                <span>{order.customer?.firstName} {order.customer?.lastName}</span>
                                            </div>

                                            {/* City */}
                                            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                                                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                                <span>{order.customer?.city}</span>
                                            </div>

                                            {/* Purchased items list */}
                                            <div className="border-t border-b border-slate-50 py-2.5 my-3 space-y-1.5">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="flex items-start justify-between text-[11px]">
                                                        <span className="text-slate-600 font-semibold truncate max-w-[130px]">{item.name}</span>
                                                        <span className="text-slate-400 font-black">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Price and Advance actions */}
                                            <div className="flex items-center justify-between mt-4 gap-2">
                                                <div className="text-xs font-black text-slate-800">{currency}{order.summary?.total}</div>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, col.nextStatus)}
                                                    className="inline-flex items-center gap-1 bg-slate-900 hover:bg-green-500 text-white hover:text-white px-2.5 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all shadow-sm cursor-pointer border-none"
                                                >
                                                    <span>{col.actionText}</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTracker;
