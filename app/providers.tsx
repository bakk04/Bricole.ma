"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./api/context/AuthContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
