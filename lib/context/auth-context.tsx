"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  username: string;
  role: "admin" | "engineer";
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    // Simple validation for Phase 2 (will be replaced with Supabase)
    // Demo credentials: admin/admin123 or engineer/engineer123
    if (
      (username === "admin" && password === "admin123") ||
      (username === "engineer" && password === "engineer123")
    ) {
      const role = username === "admin" ? "admin" : "engineer";
      setUser({
        username,
        role,
        fullName: username === "admin" ? "Admin User" : "Engineer User",
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
