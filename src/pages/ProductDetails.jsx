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
            <p className="text-sm text-gray-600 mb-4">
                <Link to="/" className="hover:text-[#00FF33]">Home</Link> /
                <Link to="/all-products" className="hover:text-[#00FF33]"> Products</Link> /
                <Link to={`/products/category/${product.category.toLowerCase().replace(/\s+/g, '')}`} className="hover:text-[#00FF33]"> {product.category}</Link> /
                <span className="text-indigo-500"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-16 mt-4">
                <div className="flex gap-3">
                    <div className="border border-gray-500/30 max-w-md rounded overflow-hidden">
                        <img src={thumbnail || product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2">
                    <h1 className="text-3xl font-medium">{product.name}</h1>

                    <div className="flex items-center gap-0.5 mt-1">
                        {Array(5).fill('').map((_, i) => (
                            <span key={i} className={`text-xl ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                        <p className="text-base ml-2">({product.reviews || 0} reviews)</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500/70 line-through">MRP: {currency}{product.oldPrice}</p>
                        <p className="text-2xl font-medium">MRP: {currency}{product.price}</p>
                        <span className="text-gray-500/70">(inclusive of all taxes)</span>
                    </div>

                    <p className="text-base font-medium mt-6">About Product</p>
                    <p className="text-gray-500/70 mt-2">
                        This is a quality {product.category.toLowerCase()} item available at VMS Super Mart. 
                        Get the best value for your money with our competitive pricing.
                    </p>

                    <div className="flex items-center mt-10 gap-4 text-base">
                        <button onClick={() => addToCart(product.id)} className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition" >
                            Add to Cart
                        </button>
                        <button onClick={()=> {addToCart(product.id);navigate("/cart")}} className="w-full py-3.5 cursor-pointer font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition" >
                            Buy now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ProductDetails;