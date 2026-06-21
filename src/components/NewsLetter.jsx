import React from 'react';

const NewsLetter = () => {
    return (
        <div className="w-full flex justify-center py-8 px-1 sm:px-2">
            <div className="bg-white rounded-none shadow border border-gray-200 w-full max-w-4xl p-5 sm:p-8 flex flex-col items-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-center">Never Miss a Deal!</h1>
                <p className="text-gray-500 text-sm sm:text-base md:text-lg mb-6 text-center">
                    Subscribe to get the latest offers, new arrivals, and exclusive discounts
                </p>
                <form className="flex flex-col sm:flex-row w-full max-w-xl gap-3 sm:gap-0">
                    <input
                        className="flex-1 border border-gray-300 rounded-none px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-base w-full"
                        type="email"
                        placeholder="Enter your email id"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-[#00e51b] hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-none transition-colors duration-200 text-base w-full sm:w-auto shrink-0"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewsLetter;