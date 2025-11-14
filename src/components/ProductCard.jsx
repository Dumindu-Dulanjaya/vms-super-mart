import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

const ProductCard = ({ product }) => {
  const [count, setCount] = useState(0);

  return (
    <div className="w-full border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link to={`/product/${product.slug}`}>
        {/* Product Image */}
        <div className="bg-gray-50 p-6 flex items-center justify-center h-52">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/250"; }}
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4">
        <p className="text-gray-400 text-sm mb-1">{product.category}</p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-gray-800 font-semibold text-base mb-2 hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <span key={i} className={i < (product.rating || 0) ? "text-yellow-400 text-sm" : "text-gray-300 text-sm"}>
                ★
              </span>
            ))}
          <span className="text-gray-400 text-xs ml-1">({product.reviews || 0})</span>
        </div>

        {/* Price + Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-green-600 font-bold text-lg sm:text-xl">Rs.{product.price}</span>
            <span className="text-gray-400 line-through text-xs sm:text-sm">Rs.{product.oldPrice}</span>
          </div>

          {count === 0 ? (
            <button
              onClick={() => setCount(1)}
              className="bg-green-50 hover:bg-green-600 text-green-600 hover:text-white border border-green-200 hover:border-green-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 whitespace-nowrap"
            >
              <ShoppingCart size={16} />
              <span className="text-sm font-medium">Add</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg border border-green-300">
              <button
                onClick={() => setCount((prev) => Math.max(prev - 1, 0))}
                className="text-green-600 font-bold text-lg w-6 h-6 flex items-center justify-center hover:bg-green-200 rounded transition-colors"
              >
                -
              </button>
              <span className="text-green-800 font-semibold w-8 text-center">{count}</span>
              <button
                onClick={() => setCount((prev) => prev + 1)}
                className="text-green-600 font-bold text-lg w-6 h-6 flex items-center justify-center hover:bg-green-200 rounded transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
