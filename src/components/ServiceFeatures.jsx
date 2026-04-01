import React from 'react';
import { Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

const ServiceFeatures = () => {
    const features = [
        {
            icon: <Truck size={32} />,
            title: 'Free Shipping',
            description: 'Free shipping on orders over Rs. 1000',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            icon: <ShieldCheck size={32} />,
            title: '100% Secure',
            description: 'Safe and secure payment options',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            icon: <CreditCard size={32} />,
            title: 'Easy Returns',
            description: '7-day hassle-free returns',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            icon: <Headphones size={32} />,
            title: '24/7 Support',
            description: 'Dedicated customer support',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ];

    return (
        <div className="py-16 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group flex flex-col items-center text-center p-8 bg-white rounded-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-b-4 border-transparent hover:border-[#00FF33] cursor-default"
                        >
                            <div className={`${feature.bgColor} ${feature.color} p-5 mb-6 relative transition-all duration-700 group-hover:scale-110`}>
                                {/* Background glow effect on hover using pure CSS */}
                                <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
                                {/* The Icon itself with 360 Spin Animation */}
                                <div className="relative z-10 transition-transform duration-700 ease-in-out group-hover:[transform:rotateY(360deg)] group-hover:rotate-[360deg]">
                                    {feature.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight transition-colors duration-300 group-hover:text-[#00FF33]">{feature.title}</h3>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceFeatures;