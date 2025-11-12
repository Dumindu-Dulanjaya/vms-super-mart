import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { bestSellers, categories } from "../assets/assets";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate unique slug from name
  const generateSlug = (name) => {
    const nameSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const uniqueId = Math.random().toString(36).substring(2, 10); // Random 8-char string
    return `${nameSlug}-${uniqueId}`;
  };

  // Use packaged assets' sample products so images resolve correctly
  // Combine bestSellers and categories into one products list so "All Products" shows everything
  const categoryProducts = categories.map((c, idx) => ({
    id: bestSellers.length + idx + 1,
    name: c.text,
    category: c.type || c.path || "Misc",
    price: Math.floor(100 + (idx + 1) * 100),
    oldPrice: Math.floor(100 + (idx + 1) * 120),
    rating: 4,
    reviews: 0,
    image: c.image,
    slug: generateSlug(c.text),
  }));

  const dummyProducts = [...bestSellers.map(p => ({
    ...p,
    slug: generateSlug(p.name)
  })), ...categoryProducts];

  // ✅ Load products when app starts
  useEffect(() => {
    console.log('Setting products:', dummyProducts.length, 'products');
    setProducts(dummyProducts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add product to cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to cart");
  };

  // Update cart item quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart Updated");
  };

  // Remove product from cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
      setCartItems(cartData);
      toast.success("Removed from cart");
    }
  };

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    currency,
    products,
    addToCart,
    cartItems,
    updateCartItem,
    removeFromCart,
    searchQuery,
    setSearchQuery,
    showUserLogin,
    setShowUserLogin,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
