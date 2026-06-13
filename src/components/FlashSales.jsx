import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from './ProductCard';
import { Clock, ChevronRight } from 'lucide-react';

const FlashSales = () => {
    const { products } = useAppContext();
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Get flash sale products (first 6 products with high discount)
    const flashSaleProducts = products
        .filter(p => (p.oldPrice - p.price) / p.oldPrice > 0.15) // More than 15% discount
        .slice(0, 6);

    useEffect(() => {
        // Set end time to midnight today
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);

            const difference = midnight - now;

            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    if (flashSaleProducts.length === 0) return null;

    return (
        <div className="py-12 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-none flex items-center justify-center animate-pulse">
                                <Clock size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">Flash Sale</h2>
                                <p className="text-gray-600 text-sm">Limited time offers</p>
                            </div>
                        </div>

                        {/* Countdown Timer */}
                        <div className="flex items-center gap-2 ml-6">
                            <span className="text-gray-600 text-sm">Ending in:</span>
                            <div className="flex gap-2">
                                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-3 py-2 rounded-none font-bold min-w-[50px] text-center">
                                    <div className="text-xl">{String(timeLeft.hours).padStart(2, '0')}</div>
                                    <div className="text-xs">Hours</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-600">:</div>
                                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-3 py-2 rounded-none font-bold min-w-[50px] text-center">
                                    <div className="text-xl">{String(timeLeft.minutes).padStart(2, '0')}</div>
                                    <div className="text-xs">Mins</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-600">:</div>
                                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-3 py-2 rounded-none font-bold min-w-[50px] text-center">
                                    <div className="text-xl">{String(timeLeft.seconds).padStart(2, '0')}</div>
                                    <div className="text-xs">Secs</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link
                        to="/all-products"
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                    >
                        Shop All
                        <ChevronRight size={20} />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
                    {flashSaleProducts.map((product) => (
                        <div key={product.id} className="relative">
                            {/* Discount Badge */}
                            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-none text-sm font-bold shadow-lg">
                                -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                            </div>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FlashSales;