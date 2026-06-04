import React, { useState } from "react";
import { bestSellers } from "../assets/assets";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BestSellers() {
  return (
    <section className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Best Sellers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bestSellers.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={1200} />
    </section>
  );
}

function ProductCard({ product }) {
  const [count, setCount] = useState(0);
  
  const handleRemove = () => {
    if (count > 0) {
      toast.warning(`Removed 1 ${product.name} ❌`);
      setCount((prev) => prev - 1);
    }
  };
  
  const handleAdd = () => {
    toast.success(`Added 1 ${product.name} ✅`);
    setCount((prev) => prev + 1);
  };
  
  return (
    <div className="bg-white shadow rounded-none overflow-hidden hover:shadow-lg transition p-4 flex flex-col">
      {/* Product Image */}
      <div className="flex items-center justify-center h-40 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover max-h-40 transform transition-transform duration-300 hover:scale-105"
        />
      </div>
      {/* Product Info */}
      <div className="flex-1 mt-3">
        <h3 className="font-semibold truncate">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>
        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-green-600">
            Rs. {product.price}
          </span>
          {product.oldPrice > product.price && (
            <span className="text-gray-400 line-through text-sm">
              Rs. {product.oldPrice}
            </span>
          )}
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1 mt-2 text-yellow-500">
          {"★".repeat(product.rating)}
          {"☆".repeat(5 - product.rating)}
          <span className="text-gray-600 text-sm ml-2">
            ({product.reviews})
          </span>
        </div>
      </div>
     
      {/* Add to Cart */}
      <div className="mt-4">
        {count === 0 ? (
          <button
            className="w-full flex items-center justify-center gap-1 bg-indigo-100 border border-indigo-300 h-[36px] rounded-none text-indigo-600 font-medium hover:bg-indigo-200 transition"
            onClick={handleAdd}
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between w-full h-[36px] bg-indigo-500/25 rounded-none select-none px-2">
            <button
              onClick={handleRemove}
              className="cursor-pointer text-md px-2 h-full"
            >
              -
            </button>
            <span className="w-5 text-center">{count}</span>
            <button
              onClick={handleAdd}
              className="cursor-pointer text-md px-2 h-full"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}