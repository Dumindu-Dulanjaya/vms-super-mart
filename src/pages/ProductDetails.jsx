import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/useAppContext";

const ProductDetails  = () => {
    const { products, addToCart } = useAppContext();
    const { slug } = useParams();
    const navigate = useNavigate();
    const currency = "Rs.";
    const [thumbnail, setThumbnail] = useState(null);


    const product = products.find((item) => item.slug === slug);

    useEffect(() => {
        if (product && product.image) {
            setThumbnail(product.image);
        }
    }, [product]);

    if (!product) {
        return <div className="mt-12 text-center">Product not found</div>;
    }

    return (
        <div className="mt-12">
            {/* Breadcrumb */}
            <p className="text-sm text-gray-600 mb-4">
                <Link to="/" className="hover:text-[#00FF33]">Home</Link> /
                <Link to="/all-products" className="hover:text-[#00FF33]"> Products</Link> /
                <Link to={`/products/category/${product.category.toLowerCase().replace(/\s+/g, '')}`} className="hover:text-[#00FF33]"> {product.category}</Link> /
                <span className="text-indigo-500"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-8 mt-8">
                {/* Left side - Image Gallery */}
                <div className="flex flex-col-reverse md:flex-row gap-4 w-full md:w-1/2">
                    {/* Thumbnail Images - Vertical on left */}
                    <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible">
                        {[product.image, product.image, product.image, product.image].map((img, index) => (
                            <div 
                                key={index}
                                onClick={() => setThumbnail(img)}
                                className={`border-2 ${thumbnail === img || (thumbnail === null && index === 0) ? 'border-gray-800' : 'border-gray-300'} rounded-lg overflow-hidden cursor-pointer hover:border-gray-600 transition w-20 h-20 flex-shrink-0`}
                            >
                                <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
                        <img src={thumbnail || product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Right side - Product Details */}
                <div className="w-full md:w-1/2">
                    <h1 className="text-3xl font-medium text-gray-800">{product.name}</h1>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mt-3">
                        {Array(5).fill('').map((_, i) => (
                            <span key={i} className={`text-lg ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                        <p className="text-sm text-gray-600 ml-2">({product.reviews || 0})</p>
                    </div>

                    {/* Price */}
                    <div className="mt-6">
                        <p className="text-sm text-gray-500 line-through">MRP: {currency}{product.oldPrice}</p>
                        <p className="text-3xl font-semibold text-gray-800 mt-1">MRP: {currency}{product.price}</p>
                        <span className="text-sm text-gray-500">(inclusive of all taxes)</span>
                    </div>

                    {/* About Product */}
                    <div className="mt-8">
                        <p className="text-lg font-semibold text-gray-800 mb-2">About Product</p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                            <li>High-quality material</li>
                            <li>Comfortable for everyday use</li>
                            <li>Available in different sizes</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center mt-10 gap-4">
                        <button 
                            onClick={() => addToCart(product.id)} 
                            className="flex-1 py-3.5 px-6 font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition rounded-lg border border-gray-300"
                        >
                            Add to Cart
                        </button>
                        <button 
                            onClick={() => { addToCart(product.id); navigate("/cart"); }} 
                            className="flex-1 py-3.5 px-6 font-medium bg-blue-600 text-white hover:bg-blue-700 transition rounded-lg"
                        >
                            Buy now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ProductDetails;