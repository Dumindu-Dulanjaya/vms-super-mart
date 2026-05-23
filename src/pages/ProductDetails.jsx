import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/useAppContext";
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ProductDetails  = () => {
    const { products, addToCart, rateProduct } = useAppContext();
    const { slug } = useParams();
    const navigate = useNavigate();
    const currency = "Rs.";
    const [thumbnail, setThumbnail] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [ratingScore, setRatingScore] = useState(0);
    const [hoverScore, setHoverScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasRated, setHasRated] = useState(false);

    const product = products.find((item) => item.slug === slug);

    // Get all images (main + gallery)
    const allImages = product?.images && product.images.length > 0 
        ? [product.image, ...product.images]
        : [product.image, product.image, product.image, product.image];

    useEffect(() => {
        if (product) {
            const rated = localStorage.getItem(`vms_rated_prod_${product.id}`) === 'true';
            setHasRated(rated);
            setRatingScore(0);
            setHoverScore(0);
        }
    }, [product]);

    useEffect(() => {
        if (product && product.image) {
            setThumbnail(product.image);
            setCurrentImageIndex(0);
        }
    }, [product]);

    const handleSubmitRating = async () => {
        if (ratingScore === 0) {
            toast.error("Please select a rating star first!");
            return;
        }

        setIsSubmitting(true);
        try {
            await rateProduct(product.id, ratingScore);
            localStorage.setItem(`vms_rated_prod_${product.id}`, 'true');
            setHasRated(true);
            toast.success("Thank you for your rating! ⭐");
        } catch (e) {
            // Error toast handled in context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrevImage = () => {
        const newIndex = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
        setThumbnail(allImages[newIndex]);
    };

    const handleNextImage = () => {
        const newIndex = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
        setThumbnail(allImages[newIndex]);
    };

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
                        {allImages.slice(0, 5).map((img, index) => (
                            <div 
                                key={index}
                                onClick={() => {
                                    setThumbnail(img);
                                    setCurrentImageIndex(index);
                                }}
                                className={`border-2 ${currentImageIndex === index ? 'border-gray-800 ring-2 ring-indigo-400' : 'border-gray-300'} rounded-lg overflow-hidden cursor-pointer hover:border-gray-600 transition w-20 h-20 flex-shrink-0 relative`}
                            >
                                <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                    {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Image with Navigation */}
                    <div className="flex-1 relative bg-gray-50 border border-gray-300 rounded-lg overflow-hidden group">
                        <img src={thumbnail || product.image} alt={product.name} className="w-full h-full object-cover" />
                        
                        {/* Navigation Arrows */}
                        <button 
                            onClick={handlePrevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                            {currentImageIndex + 1}/{allImages.length}
                        </div>
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
                    <div className="mt-6 mb-6">
                        <p className="text-sm text-gray-500 line-through">MRP: {currency}{product.oldPrice}</p>
                        <p className="text-3xl font-semibold text-gray-800 mt-1">MRP: {currency}{product.price}</p>
                        <span className="text-sm text-gray-500">(inclusive of all taxes)</span>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-6">
                        {(product.stock || 0) === 0 ? (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <div>
                                    <p className="text-red-700 font-semibold">Out of Stock</p>
                                    <p className="text-red-600 text-sm">This item is currently unavailable</p>
                                </div>
                            </div>
                        ) : (product.stock || 0) < 5 ? (
                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg px-4 py-3 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                <div>
                                    <p className="text-yellow-700 font-semibold">Limited Stock</p>
                                    <p className="text-yellow-600 text-sm">Only {product.stock} items available</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="text-green-700 font-semibold">In Stock</p>
                                    <p className="text-green-600 text-sm">{product.stock} items available</p>
                                </div>
                            </div>
                        )}
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
                            disabled={(product.stock || 0) === 0}
                            className={`flex-1 py-3.5 px-6 font-medium rounded-lg border transition ${
                                (product.stock || 0) === 0
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'
                            }`}
                        >
                            {(product.stock || 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button 
                            onClick={() => { addToCart(product.id); navigate("/cart"); }}
                            disabled={(product.stock || 0) === 0}
                            className={`flex-1 py-3.5 px-6 font-medium rounded-lg transition ${
                                (product.stock || 0) === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {(product.stock || 0) === 0 ? 'Unavailable' : 'Buy now'}
                        </button>
                    </div>

                    {/* Interactive Ratings Card */}
                    <div className="mt-10 p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-lg font-bold text-gray-800 tracking-tight">Rate this Product</h3>
                        <p className="text-xs text-gray-500 mt-1 mb-4">Share your feedback to help other shoppers make better decisions.</p>

                        {hasRated ? (
                            <div className="flex items-center gap-3 bg-green-50/60 border border-green-200 p-4 rounded-xl text-green-800 transition-all duration-500 animate-fadeIn">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">Thank you for your feedback!</p>
                                    <p className="text-xs text-green-600">Your rating has been successfully submitted.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* Interactive Star Picker */}
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRatingScore(star)}
                                            onMouseEnter={() => setHoverScore(star)}
                                            onMouseLeave={() => setHoverScore(0)}
                                            className="text-3xl transition-transform duration-150 hover:scale-125 focus:outline-none"
                                        >
                                            <span 
                                                className={`transition-colors duration-150 ${
                                                    star <= (hoverScore || ratingScore)
                                                        ? 'text-yellow-400 drop-shadow-sm'
                                                        : 'text-gray-300'
                                                }`}
                                            >
                                                ★
                                            </span>
                                        </button>
                                    ))}
                                    {ratingScore > 0 && (
                                        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md animate-fadeIn">
                                            {ratingScore} / 5
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={handleSubmitRating}
                                    disabled={ratingScore === 0 || isSubmitting}
                                    className={`py-2.5 px-5 text-sm font-semibold rounded-xl tracking-wide transition-all ${
                                        ratingScore === 0 || isSubmitting
                                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95'
                                    }`}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Rating"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;