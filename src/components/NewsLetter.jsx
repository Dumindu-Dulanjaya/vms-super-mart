import React from 'react';

const NewsLetter = () => {
    return (
        <div className="w-full flex justify-center py-8 px-2">
            <div className="bg-white rounded-2xl shadow border border-gray-200 w-full max-w-4xl p-8 flex flex-col items-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Never Miss a Deal!</h1>
                <p className="text-gray-500 text-base md:text-lg mb-6 text-center">
                    Subscribe to get the latest offers, new arrivals, and exclusive discounts
                </p>
                <form className="flex w-full max-w-xl">
                    <input
                        className="flex-1 border border-gray-300 rounded-l-md px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-base"
                        type="email"
                        placeholder="Enter your email id"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-[#00e51b] hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-r-md transition-colors duration-200 text-base"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewsLetter;