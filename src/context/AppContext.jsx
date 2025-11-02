import { useState, createContext } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

export { AppContext };

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  // ✅ Dummy product data with required fields
  const dummyProducts = [
    { id: 1, name: "Helicopter 1", category: "Toys", price: 1000, oldPrice: 900, image: "/images/heli1.jpg", rating: 4, reviews: 10, description: "A fun toy helicopter for kids" },
    { id: 2, name: "Mug 1", category: "Kitchenware", price: 500, oldPrice: 450, image: "/images/mug1.jpg", rating: 5, reviews: 20, description: "A ceramic mug for your morning coffee" },
    { id: 3, name: "Porcelain 1", category: "Decor", price: 1500, oldPrice: 1400, image: "/images/porcelain1.jpg", rating: 3, reviews: 5, description: "Beautiful porcelain decor piece" },
    { id: 4, name: "Helicopter 2", category: "Toys", price: 1200, oldPrice: 1100, image: "/images/heli2.jpg", rating: 4, reviews: 15, description: "Advanced toy helicopter with remote control" },
    { id: 5, name: "Mug 2", category: "Kitchenware", price: 600, oldPrice: 550, image: "/images/mug2.jpg", rating: 4, reviews: 12, description: "Insulated mug to keep drinks hot" },
    { id: 6, name: "Porcelain 2", category: "Decor", price: 1800, oldPrice: 1600, image: "/images/porcelain2.jpg", rating: 5, reviews: 8, description: "Elegant porcelain vase for home decor" },
  ];
  const [products, _setProducts] = useState(dummyProducts);
  const [searchQuery, setSearchQuery] = useState('');

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
    searchQuery,
    setSearchQuery,
    updateCartItem,
    removeFromCart,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// useAppContext moved to ./useAppContext.jsx so this file exports only components (required for fast refresh)
