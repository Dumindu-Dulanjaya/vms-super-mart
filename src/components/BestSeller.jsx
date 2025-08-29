import { bestSellers } from "../assets/assets";

export default function BestSellers() {
  return (
    <section className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Best Sellers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bestSellers.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded-2xl overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.category}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold text-green-600">
                  Rs. {item.price}
                </span>
                <span className="text-gray-400 line-through text-sm">
                  Rs. {item.oldPrice}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-yellow-500">
                {"★".repeat(item.rating)}
                {"☆".repeat(5 - item.rating)}
                <span className="text-gray-600 text-sm ml-2">
                  ({item.reviews})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
