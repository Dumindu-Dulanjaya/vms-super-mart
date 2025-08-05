import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// Create the context
export const AppContext = createContext();

// Provider component
export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);

  const value = { navigate, user, setUser, setIsSeller, isSeller };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  return useContext(AppContext);
};
