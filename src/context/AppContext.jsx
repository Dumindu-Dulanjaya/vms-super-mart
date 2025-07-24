import { createContext, useContext, useState } from "react"

export Const AppContext = createContext();

export const AppContextProvider =({children})=>{
    const navigate = useNavigate();
    const [user,setuser] = useState(null)
    const [isSeller,setIsSeller] = useState(null)
    const value ={navigate,user,setuser,setIsSeller,isSeller}
    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}