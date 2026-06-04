import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// import { bestSellers, categories } from "../assets/assets";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    localStorage.getItem('vms_admin_auth') === 'true'
  );

  // Generate unique slug from name
  const generateSlug = (name) => {
    const nameSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const uniqueId = Math.random().toString(36).substring(2, 10); // Random 8-char string
    return `${nameSlug}-${uniqueId}`;
  };

  // Static fallback products have been commented out to ensure only backend-served database products are displayed.
  /*
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
  */

  const dummyProducts = [];

  // ✅ Load products when app starts
  useEffect(() => {
    // Try loading products from backend first
    const load = async () => {
      if (typeof localStorage === 'undefined') return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('vms_products', JSON.stringify(data));
          }
          return;
        }
      } catch (e) {
        // ignore and fallback
      }

      if (typeof localStorage === 'undefined') return;
      const savedProducts = localStorage.getItem('vms_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(dummyProducts);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('vms_products', JSON.stringify(dummyProducts));
        }
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAndSetProfile = async (token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const profile = {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          province: data.province || ''
        };
        setUser(profile);
        return profile;
      } else {
        localStorage.removeItem('userToken');
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to load user profile', e);
    }
  };

  // ✅ Auto-load user profile if token is present on app load
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      fetchAndSetProfile(token);
    }
  }, []);

  // Add a new product
  const addProduct = async (newProduct) => {
    // If admin is authenticated, try creating product via backend
    const token = localStorage.getItem('vms_admin_token');
    if (isAdminAuthenticated && token) {
      return fetch(`${import.meta.env.VITE_API_URL || ''}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newProduct)
      })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to create product');
        const created = await res.json();
        const updatedProducts = [created, ...products];
        setProducts(updatedProducts);
        localStorage.setItem('vms_products', JSON.stringify(updatedProducts));
        toast.success('Product added successfully!');
        return created;
      })
      .catch((err) => {
        toast.error('Failed to add product via backend. Saved locally instead.');
        // fallback to local
      });
    }

    // fallback for local storage dev mode
    const productWithId = {
      ...newProduct,
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      slug: generateSlug(newProduct.name),
      rating: 4,
      reviews: 0
    };
    
    const updatedProducts = [productWithId, ...products];
    setProducts(updatedProducts);
    localStorage.setItem('vms_products', JSON.stringify(updatedProducts));
    toast.success("Product added successfully!");
    
    // allow await addProduct(...) to resolve
    return productWithId;
  };

  const adminLogin = (email, password) => {
    return fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(async (res) => {
      if (!res.ok) throw new Error('Invalid credentials');
      const body = await res.json();
      setIsAdminAuthenticated(true);
      localStorage.setItem('vms_admin_auth', 'true');
      // store token if provided
      if (body.accessToken) localStorage.setItem('vms_admin_token', body.accessToken);
      toast.success('Admin access granted!');
      return true;
    })
    .catch((err) => {
      toast.error('Invalid credentials!');
      return false;
    });
  }

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('vms_admin_auth');
    localStorage.removeItem('vms_admin_token');
    toast.success("Logged out successfully!");
    navigate('/admin/login');
  }

  // Add product to cart
  const addToCart = (itemId) => {
    const product = products.find(p => p.id === Number(itemId));
    const currentQty = cartItems[itemId] || 0;
    
    if (product) {
      if (product.stock <= 0) {
        toast.error("This product is out of stock!");
        return;
      }
      if (currentQty >= product.stock) {
        toast.error(`Only ${product.stock} items available in stock!`);
        return;
      }
    }

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
    const product = products.find(p => p.id === Number(itemId));
    if (product && quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock!`);
      return;
    }

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

  // Add to wishlist
  const addToWishlist = (itemId) => {
    if (!wishlistItems.includes(itemId)) {
      setWishlistItems([...wishlistItems, itemId]);
      toast.success("Added to wishlist");
    }
  };

  // Remove from wishlist
  const removeFromWishlist = (itemId) => {
    setWishlistItems(wishlistItems.filter(id => id !== itemId));
    toast.success("Removed from wishlist");
  };

  // Toggle wishlist
  const toggleWishlist = (itemId) => {
    if (wishlistItems.includes(itemId)) {
      removeFromWishlist(itemId);
    } else {
      addToWishlist(itemId);
    }
  };

  const registerUser = async (userData) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Registration failed');
      }

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('userToken', data.accessToken);
        await fetchAndSetProfile(data.accessToken);
        toast.success('Account created successfully!');
      }
      return data;
    } catch (e) {
      toast.error(e.message || 'Registration failed');
      throw e;
    }
  };

  const userLogin = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Login failed');
      }

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('userToken', data.accessToken);
        await fetchAndSetProfile(data.accessToken);
        toast.success('Logged in successfully!');
      }
      return data;
    } catch (e) {
      toast.error(e.message || 'Login failed');
      throw e;
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Google login failed');
      }

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('userToken', data.accessToken);
        await fetchAndSetProfile(data.accessToken);
        toast.success('Logged in with Google successfully!');
      }
      return data;
    } catch (e) {
      toast.error(e.message || 'Google login failed');
      throw e;
    }
  };

  const userLogout = () => {
    setUser(null);
    localStorage.removeItem('userToken');
    toast.success('Logged out successfully!');
    navigate('/');
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
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    searchQuery,
    setSearchQuery,
    showUserLogin,
    setShowUserLogin,
    setCartItems,
    addProduct,
    isAdminAuthenticated,
    adminLogin,
    adminLogout,
    registerUser,
    userLogin,
    googleLogin,
    userLogout,
    checkout: async (customerData, paymentMethod = 'card') => {
      // Build items from cartItems
      const items = Object.keys(cartItems).map(id => ({ productId: parseInt(id), quantity: cartItems[id] }));
      const payload = {
        items,
        ...customerData,
        paymentMethod,
        userId: user ? user.id : null,
      };

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Checkout failed');
        }

        const order = await res.json();
        setCartItems({});
        toast.success('Order placed successfully!');
        return order;
      } catch (e) {
        toast.error(e.message || 'Checkout failed');
        throw e;
      }
    },
    rateProduct: async (productId, score) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/${productId}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to submit rating');
        }

        const updatedProduct = await res.json();
        
        // Update local state list of products in AppContext
        const updatedProducts = products.map((p) => p.id === productId ? updatedProduct : p);
        setProducts(updatedProducts);
        localStorage.setItem('vms_products', JSON.stringify(updatedProducts));
        
        return updatedProduct;
      } catch (e) {
        toast.error(e.message || 'Failed to submit rating');
        throw e;
      }
    }
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

export { AppContextProvider as AppProvider };