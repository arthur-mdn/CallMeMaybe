import React, {createContext, useState, useContext, useEffect} from 'react';
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authStatus, setAuthStatus] = useState("loading");

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/auth/validate-session`, { withCredentials: true })
            .then(response => {
                setAuthStatus(response.data.isAuthenticated ? "authenticated" : "unauthenticated");
            })
            .catch(() => {
                setAuthStatus("unauthenticated");
            });
    }, []);
    return (
        <AuthContext.Provider value={{ authStatus, setAuthStatus}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
