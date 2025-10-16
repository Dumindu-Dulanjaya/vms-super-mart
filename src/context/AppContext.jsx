import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);

  // ✅ Dummy product data with required fields
  const dummyProducts = [
    { id: 1, name: "Helicopter 1", category: "Toys", price: 1000, offerPrice: 900, image: "/images/heli1.jpg", rating: 4 },
    { id: 2, name: "Mug 1", category: "Kitchenware", price: 500, offerPrice: 450, image: "/images/mug1.jpg", rating: 5 },
    { id: 3, name: "Porcelain 1", category: "Decor", price: 1500, offerPrice: 1400, image: "/images/porcelain1.jpg", rating: 3 },
    { id: 4, name: "Helicopter 2", category: "Toys", price: 1200, offerPrice: 1100, image: "/images/heli2.jpg", rating: 4 },
    { id: 5, name: "Mug 2", category: "Kitchenware", price: 600, offerPrice: 550, image: "/images/mug2.jpg", rating: 4 },
    { id: 6, name: "Porcelain 2", category: "Decor", price: 1800, offerPrice: 1600, image: "/images/porcelain2.jpg", rating: 5 },
  ];

  // ✅ Load products when app starts
  useEffect(() => {
    setProducts(dummyProducts);
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
