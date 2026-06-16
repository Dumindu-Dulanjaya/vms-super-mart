import React from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "./ProductCard";

export default function BestSellers() {
  const { products } = useAppContext();
  
  // Filter products that have stock and take the first 4 as best sellers
  const list = products.filter(p => p.stock > 0).slice(0, 4);

  if (list.length === 0) {
    return null; // Hide the section if there are no active products
  }

  return (
    <section className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Best Sellers</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {list.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}