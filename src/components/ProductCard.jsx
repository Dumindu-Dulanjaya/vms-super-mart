import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
  const { addToCart, cartItems, toggleWishlist, wishlistItems, currency } = useAppContext();
  const isInWishlist = wishlistItems.includes(product.id);
  const cartQuantity = cartItems[product.id] || 0;

  return (
    <div className="w-full border border-gray-200 rounded-none shadow-sm bg-white overflow-hidden hover:shadow-lg transition-all duration-300 relative group">
      {/* Wishlist Heart Icon */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        className="absolute top-3 right-3 z-10 bg-white rounded-none p-2 shadow-md hover:scale-110 transition-transform"
      >
        <Heart
          size={20}
          className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}
        />
      </button>

      <Link to={`/product/${product.slug}`}>
        {/* Product Image */}
        <div className="bg-gray-50 p-6 flex items-center justify-center h-52">
          <img
            className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/250'; }}
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
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold text-xl">{currency}{product.price}</span>
            {product.oldPrice > product.price && (
              <span className="text-gray-400 line-through text-sm">{currency}{product.oldPrice}</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        {product.stock === 0 ? (
          <button
            disabled
            className="w-full bg-gray-50 text-gray-400 border border-gray-200 px-4 py-2.5 rounded-none flex items-center justify-center gap-2 cursor-not-allowed font-medium"
          >
            <ShoppingCart size={18} />
            <span>Out of Stock</span>
          </button>
        ) : cartQuantity === 0 ? (
          <button
            onClick={() => addToCart(product.id)}
            className="w-full bg-green-50 hover:bg-green-600 text-green-600 hover:text-white border border-green-200 hover:border-green-600 px-4 py-2.5 rounded-none flex items-center justify-center gap-2 transition-all duration-200 font-medium"
          >
            <ShoppingCart size={18} />
            <span>Add to Cart</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 bg-green-100 px-3 py-2.5 rounded-none border border-green-300">
            <span className="text-green-800 font-semibold">{cartQuantity} in cart</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;