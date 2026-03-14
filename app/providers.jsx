"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./api/context/AuthContext";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
