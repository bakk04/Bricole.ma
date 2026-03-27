"use client";

import { createContext, useContext, useReducer, useMemo, useEffect } from "react";
import { authReducer, initialState } from "../auth/authReducer";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const user = await res.json();
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: user,
        });
      } else if (res.status === 401) {
        dispatch({ type: "LOGOUT" });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  // Charger l'utilisateur au montage
  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      checkAuth,
    }),
    [state]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }

  return context;
}
