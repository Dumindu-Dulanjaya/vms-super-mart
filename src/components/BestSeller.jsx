import React from "react";
import ProductCard from "./ProductCard";

const BestSeller = () => {
  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Best Sellers</p>
      <div className="mt-6 flex gap-6 flex-wrap">
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>
    </div>
  );
};

export default BestSeller;
