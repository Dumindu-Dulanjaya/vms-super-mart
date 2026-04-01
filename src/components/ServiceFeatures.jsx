import React from 'react';
import { Link } from 'react-router-dom';
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
        <div className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center p-6 bg-white rounded-none shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`${feature.bgColor} ${feature.color} p-4 rounded-none mb-4`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceFeatures;