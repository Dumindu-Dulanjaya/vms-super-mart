import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

const Cart = () => {
    const { cartItems, products, currency, updateCartItem, removeFromCart, navigate, refreshProducts } = useAppContext();
    const [cartData, setCartData] = useState([]);

    useEffect(() => {
        refreshProducts();
    }, []);

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

    if (cartData.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
                <ShoppingBag size={80} className="text-gray-300 mb-6" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Add items to get started</p>
                <Link
                    to="/all-products"
                    className="bg-[#00FF33] hover:bg-[#00CC29] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                    Shop Now
                </Link>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Shopping Cart</h1>
                    <p className="text-gray-600">{cartData.length} item(s) in your cart</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {cartData.map((item, index) => {
                                const maxAvailable = item.batches && item.batches.length > 0
                                    ? item.batches[0].quantity
                                    : item.stock;
                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 ${index !== cartData.length - 1 ? 'border-b border-gray-200' : ''}`}
                                    >
                                        {/* Top section: Product Image & Details */}
                                        <div className="flex gap-4 sm:gap-6 items-start flex-1">
                                            {/* Product Image */}
                                            <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain hover:scale-110 transition-transform"
                                                    />
                                                </div>
                                            </Link>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0 text-left">
                                                <Link to={`/product/${item.slug}`}>
                                                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800 hover:text-[#00FF33] mb-1 line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-xs sm:text-sm text-gray-500 mb-1.5">{item.category}</p>
                                                
                                                {/* Price for Mobile */}
                                                <div className="sm:hidden mt-1">
                                                    <span className="text-base font-bold text-gray-900">{currency}{item.price}</span>
                                                    {item.oldPrice > item.price && (
                                                        <span className="text-xs text-gray-400 line-through ml-2">{currency}{item.oldPrice}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom section (mobile) / Right section (desktop): Controls & Price summaries */}
                                        <div className="flex-1 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:mt-0">
                                            {/* Price for Desktop */}
                                            <div className="hidden sm:block text-left">
                                                <p className="text-xl font-bold text-gray-900">{currency}{item.price}</p>
                                                {item.oldPrice > item.price && (
                                                    <p className="text-sm text-gray-400 line-through">{currency}{item.oldPrice}</p>
                                                )}
                                            </div>

                                            {/* Quantity Controls & Delete button */}
                                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200">
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity > 1) {
                                                                updateCartItem(item.id, item.quantity - 1);
                                                            } else {
                                                                removeFromCart(item.id);
                                                            }
                                                        }}
                                                        className="text-gray-500 font-bold text-base w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-gray-800 font-semibold w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity < maxAvailable) {
                                                                updateCartItem(item.id, item.quantity + 1);
                                                            }
                                                        }}
                                                        disabled={item.quantity >= maxAvailable}
                                                        className={`text-gray-500 font-bold text-base w-7 h-7 flex items-center justify-center rounded transition-colors ${
                                                            item.quantity >= maxAvailable 
                                                                ? 'opacity-30 cursor-not-allowed' 
                                                                : 'hover:bg-gray-200'
                                                        }`}
                                                        title={item.quantity >= maxAvailable ? "Stock limit reached" : "Increase quantity"}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-700 p-2.5 hover:bg-red-50 rounded-lg transition-colors border border-gray-100 sm:border-none flex items-center justify-center"
                                                    title="Remove from cart"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            {/* Subtotal for this item */}
                                            <div className="border-t border-gray-100 pt-3 sm:pt-0 sm:border-none flex justify-between sm:block text-right">
                                                <span className="text-xs text-gray-500 sm:hidden">Item Subtotal:</span>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    Subtotal: <span className="font-bold text-[#00FF33]">{currency}{(item.price * item.quantity).toLocaleString()}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Continue Shopping */}
                        <Link
                            to="/all-products"
                            className="inline-flex items-center gap-2 mt-6 text-[#00FF33] hover:text-[#00CC29] font-semibold transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

                            {/* Price Details */}
                            <div className="space-y-3 mb-6">
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

                            {/* Checkout Button */}
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-[#00FF33] hover:bg-[#00CC29] text-white py-4 rounded-lg font-semibold text-lg transition-colors mb-3"
                            >
                                Proceed to Checkout
                            </button>

                            {/* Additional Info */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p>Free shipping on orders over {currency}1000</p>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-gray-600 mt-3">
                                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p>7-day return policy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;