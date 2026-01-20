import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";

const ProductDetails  = () => {
    const{products,navigate,currency,addToCart}=useAppContext();
    const { slug } = useParams();
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    const product = products.find((item) => item.slug === slug);

    useEffect(() => {
        if (product && product.image) {
            setThumbnail(product.image);
        }
        
        // Get related products from same category
        if (product) {
            const related = products
                .filter(p => p.category === product.category && p.id !== product.id)
                .slice(0, 3);
            setRelatedProducts(related);
        }
    }, [product, products]);

    // Show loading if products haven't loaded yet
    if (products.length === 0) {
        return (
            <div className="mt-12 text-center py-16">
                <h2 className="text-2xl text-gray-500">Loading...</h2>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="mt-12 text-center py-16">
                <h2 className="text-2xl text-gray-500">Product not found</h2>
                <Link to="/products" className="text-indigo-600 hover:underline mt-4 inline-block">Back to Products</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6">
                <Link to="/" className="hover:text-gray-700">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/products" className="hover:text-gray-700">Products</Link>
                <span className="mx-2">/</span>
                <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-gray-700">{product.category}</Link>
                <span className="mx-2">/</span>
                <span className="text-indigo-600 font-medium">{product.name}</span>
            </div>

            {/* Product Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Left: Product Images */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Thumbnail Images (vertical on left) */}
                    <div className="flex md:flex-col gap-3 order-2 md:order-1">
                        {[product.image, product.image, product.image, product.image].slice(0, 4).map((img, index) => (
                            <div 
                                key={index}
                                onClick={() => setThumbnail(img)}
                                className={`w-20 h-20 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                    thumbnail === img ? 'border-indigo-500' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>

                    {/* Main Product Image */}
                    <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-8 order-1 md:order-2">
                        <img 
                            src={thumbnail || product.image} 
                            alt={product.name} 
                            className="w-full h-auto object-contain max-h-96"
                        />
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className="flex flex-col">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center gap-1">
                            {Array(5).fill('').map((_, i) => (
                                <span key={i} className={`text-lg ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                            ))}
                        </div>
                        <span className="text-gray-600">({product.reviews || 4})</span>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <p className="text-gray-400 text-sm line-through mb-1">MRP: {currency}{product.oldPrice}</p>
                        <p className="text-3xl font-bold text-gray-900">MRP: {currency}{product.price}</p>
                        <p className="text-gray-500 text-sm mt-1">(Inclusive of all taxes)</p>
                    </div>

                    {/* About Product */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">About Product</h2>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Fresh and high quality {product.category.toLowerCase()}</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Perfect for your daily needs</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Best value for money at VMS Super Mart</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-auto">
                        <button 
                            onClick={() => addToCart(product.id)} 
                            className="flex-1 py-4 px-6 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                        >
                            Add to Cart
                        </button>
                        <button 
                            onClick={() => {addToCart(product.id); navigate("/cart");}} 
                            className="flex-1 py-4 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                        >
                            Buy now
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


export default ProductDetails;