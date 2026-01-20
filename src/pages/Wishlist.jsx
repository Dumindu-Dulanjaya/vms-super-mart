import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

const Wishlist = () => {
    const { wishlistItems, products, currency, addToCart, removeFromWishlist } = useAppContext();

    const wishlistProducts = products.filter(product => wishlistItems.includes(product.id));

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
                <Heart size={80} className="text-gray-300 mb-6" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-6">Add items you love to your wishlist</p>
                <Link
                    to="/all-products"
                    className="bg-[#00FF33] hover:bg-[#00CC29] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wishlist</h1>
                    <p className="text-gray-600">{wishlistProducts.length} item(s) in your wishlist</p>
                </div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {wishlistProducts.map((product) => (
                        <div
                            key={product.id}
                            className="w-full border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden hover:shadow-lg transition-all duration-300 relative group"
                        >
                            {/* Remove from Wishlist Button */}
                            <button
                                onClick={() => removeFromWishlist(product.id)}
                                className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform hover:bg-red-50"
                                title="Remove from wishlist"
                            >
                                <Trash2 size={18} className="text-red-500" />
                            </button>

                            <Link to={`/product/${product.slug}`}>
                                {/* Product Image */}
                                <div className="bg-gray-50 p-6 flex items-center justify-center h-52">
                                    <img
                                        className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                                        src={product.image}
                                        alt={product.name}
                                        loading="lazy"
                                    />
                                </div>
                            </Link>

                            {/* Product Details */}
                            <div className="p-4">
                                {/* Category */}
                                <p className="text-gray-400 text-sm mb-1">{product.category}</p>

                                {/* Product Name */}
                                <Link to={`/product/${product.slug}`}>
                                    <h3 className="text-gray-800 font-semibold text-base mb-2 hover:text-green-600 transition-colors line-clamp-2 min-h-[3rem]">
                                        {product.name}
                                    </h3>
                                </Link>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mb-3">
                                    {Array(5)
                                        .fill("")
                                        .map((_, i) => (
                                            <span key={i} className={i < product.rating ? "text-yellow-400 text-sm" : "text-gray-300 text-sm"}>
                                                ★
                                            </span>
                                        ))}
                                    <span className="text-gray-400 text-xs ml-1">({product.reviews})</span>
                                </div>

                                {/* Price */}
                                <div className="mb-3">
                                    <span className="text-green-600 font-bold text-xl">{currency}{product.price}</span>
                                    <span className="text-gray-400 line-through text-sm ml-2">{currency}{product.oldPrice}</span>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={() => {
                                        addToCart(product.id);
                                        removeFromWishlist(product.id);
                                    }}
                                    className="w-full bg-[#00FF33] hover:bg-[#00CC29] text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-medium"
                                >
                                    <ShoppingCart size={18} />
                                    <span>Move to Cart</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;