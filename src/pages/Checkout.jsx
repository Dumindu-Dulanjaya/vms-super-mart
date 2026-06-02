import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MapPin, CreditCard, Wallet, Check, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { cartItems, products, currency, setCartItems, checkout, user } = useAppContext();
    const navigate = useNavigate();
    const [cartData, setCartData] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cod');
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
        return cartData.reduce((total, item) => total + ((item.oldPrice - item.price) * item.quantity), 0);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'province'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
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