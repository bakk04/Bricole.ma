"use client";

import { createContext, useContext, useReducer, useMemo } from "react";
import { authReducer, initialState } from "../auth/authReducer";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Memoize the value to avoid unnecessary re-renders
    const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth doit être utilisé dans un AuthProvider");
    }

    return context;
}