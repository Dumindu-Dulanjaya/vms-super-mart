import React from 'react'
import { useAppContext } from '../context/AppContext'

const Login = ({ isOpen, onClose }) => {
    const { setUser } = useAppContext();
    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    // Debug logging
    React.useEffect(() => {
        console.log("Login modal - isOpen:", isOpen);
        console.log("Login modal - onClose function:", typeof onClose);
    }, [isOpen, onClose]);

    // Test: Force modal to show
    // React.useEffect(() => {
    //     console.log("Login component mounted");
    // }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted with state:", state);
        console.log("Form data:", { name, email, password });
        
        if (state === "login") {
            if (!email.trim() || !password.trim()) {
                alert("Please fill in all fields");
                return;
            }
            
            try {
                console.log("Processing login...");
                // Set user in context
                setUser({ 
                    name: email.split('@')[0], 
                    email: email 
                });
                alert("Login successful!");
                // Reset form
                setEmail("");
                setPassword("");
                onClose && onClose();
            } catch (error) {
                console.error("Login error:", error);
                alert("Login failed. Please try again.");
            }
        } else {
            if (!name.trim() || !email.trim() || !password.trim()) {
                alert("Please fill in all fields");
                return;
            }
            
            try {
                console.log("Processing registration...");
                // Set user in context after registration
                setUser({ 
                    name: name, 
                    email: email 
                });
                alert("Account created successfully!");
                // Reset form
                setName("");
                setEmail("");
                setPassword("");
                onClose && onClose();
            } catch (error) {
                console.error("Registration error:", error);
                alert("Registration failed. Please try again.");
            }
        }
    };

    const handleClose = () => {
        // Reset form when closing
        setName("");
        setEmail("");
        setPassword("");
        setState("login");
        onClose && onClose();
    };

    if (!isOpen) {
        console.log("Login modal not showing because isOpen is:", isOpen);
        return null;
    }

    console.log("Login modal should be visible now, isOpen:", isOpen);

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4'>
            <div className="relative">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white">
                    <p className="text-2xl font-medium m-auto">
                        <span className="text-indigo-500">User</span> {state === "login" ? "Login" : "Sign Up"}
                    </p>
                    {state === "register" && (
                        <div className="w-full">
                            <p>Name</p>
                            <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500" type="text" required />
                        </div>
                    )}
                    <div className="w-full">
                        <p>Email</p>
                        <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500" type="email" required />
                    </div>
                    <div className="w-full">
                        <p>Password</p>
                        <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500" type="password" required />
                    </div>
                    {state === "register" ? (
                        <p>
                            Already have account? <span onClick={() => setState("login")} className="text-indigo-500 cursor-pointer">click here</span>
                        </p>
                    ) : (
                        <p>
                            Create an account? <span onClick={() => setState("register")} className="text-indigo-500 cursor-pointer">click here</span>
                        </p>
                    )}
                    <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer">
                        {state === "register" ? "Create Account" : "Login"}
                    </button>
                </form>
                
                {/* Close button outside form */}
                <button 
                    type="button"
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
                >
                    ×
                </button>
            </div>
        </div>
    )
}

export default Login
