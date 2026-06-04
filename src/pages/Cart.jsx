import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

const Cart = () => {
    const { cartItems, products, currency, updateCartItem, removeFromCart, navigate } = useAppContext();
    const [cartData, setCartData] = useState([]);

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
        return cartData.reduce((total, item) => total + ((item.oldPrice - item.price) * item.quantity), 0);
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
                            {cartData.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`p-6 flex gap-6 ${index !== cartData.length - 1 ? 'border-b border-gray-200' : ''}`}
                                >
                                    {/* Product Image */}
                                    <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain hover:scale-110 transition-transform"
                                            />
                                        </div>
                                    </Link>

                                    {/* Product Details */}
                                    <div className="flex-1">
                                        <Link to={`/product/${item.slug}`}>
                                            <h3 className="text-lg font-semibold text-gray-800 hover:text-[#00FF33] mb-1">
                                                {item.name}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-gray-500 mb-3">{item.category}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Price */}
                                                <div>
                                                    <p className="text-xl font-bold text-gray-900">{currency}{item.price}</p>
                                                    <p className="text-sm text-gray-400 line-through">{currency}{item.oldPrice}</p>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity > 1) {
                                                                updateCartItem(item.id, item.quantity - 1);
                                                            } else {
                                                                removeFromCart(item.id);
                                                            }
                                                        }}
                                                        className="text-gray-600 font-bold text-lg w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-gray-800 font-semibold w-10 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity < item.stock) {
                                                                updateCartItem(item.id, item.quantity + 1);
                                                            }
                                                        }}
                                                        disabled={item.quantity >= item.stock}
                                                        className={`text-gray-600 font-bold text-lg w-7 h-7 flex items-center justify-center rounded transition-colors ${
                                                            item.quantity >= item.stock 
                                                                ? 'opacity-30 cursor-not-allowed' 
                                                                : 'hover:bg-gray-200'
                                                        }`}
                                                        title={item.quantity >= item.stock ? "Stock limit reached" : "Increase quantity"}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove from cart"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        {/* Subtotal for this item */}
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-sm text-gray-600">
                                                Subtotal: <span className="font-semibold text-gray-800">{currency}{item.price * item.quantity}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                    <span className="font-semibold">-{currency}{getCartDiscount()}</span>
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