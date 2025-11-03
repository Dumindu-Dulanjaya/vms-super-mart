import React from "react";
import { useAppContext } from "../context/useAppContext";

const ProductCard = ({ product }) => {
  const { navigate } = useAppContext();
  const [count, setCount] = React.useState(0);

  return product && (
    <div onClick={() => { navigate(`/product/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0); }} className="w-full border border-gray-200 rounded-lg shadow-sm bg-white p-4 hover:shadow-md transition min-h-[180px] cursor-pointer">
      {/* Product Image */}
      <div className="group flex items-center justify-center h-28 overflow-hidden">
        <img
          className="group-hover:scale-105 transition max-h-full object-contain"
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/150'; }}
        />
      </div>

      {/* Product Details */}
      <div className="mt-3 text-gray-500 text-sm">
        <p>{product.category}</p>
        <p className="text-gray-800 font-semibold text-lg truncate">
          {product.name}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mt-1">
          {Array(5)
            .fill("")
            .map((_, i) =>
              product.rating > i ? (
                <span key={i} className="text-yellow-500">★</span>
              ) : (
                <span key={i} className="text-gray-300">☆</span>
              )
            )}
          <p className="ml-1 text-gray-600 text-xs">({product.reviews})</p>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-indigo-600 font-bold text-lg">
            Rs. {product.price}{" "}
            <span className="text-gray-400 line-through text-sm">
              Rs. {product.oldPrice}
            </span>
          </p>

          {/* Add to Cart / Counter */}
          <div onClick={(e) => e.stopPropagation()}>
            {count === 0 ? (
              <button
                className="flex items-center justify-center gap-1 bg-indigo-100 border border-indigo-300 px-3 py-1 rounded text-indigo-600 font-medium"
                onClick={() => setCount(1)}
              >
                Add
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1 rounded">
                <button
                  onClick={() => setCount((prev) => Math.max(prev - 1, 0))}
                  className="cursor-pointer font-bold"
                >
                  -
                </button>
                <span className="w-5 text-center">{count}</span>
                <button
                  onClick={() => setCount((prev) => prev + 1)}
                  className="cursor-pointer font-bold"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
