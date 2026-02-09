"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { UserRole, DemoUser } from "@/lib/types";

interface AuthContextType {
  user: DemoUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "punchly_auth";

// Hardcoded demo accounts
const ACCOUNTS: Record<string, { password: string; role: UserRole; fullName: string }> = {
  admin: {
    password: "admin123",
    role: "manager",
    fullName: "Project Manager",
  },
  admin2: {
    password: "admin123",
    role: "engineer",
    fullName: "Site Engineer",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DemoUser;
        // Validate the stored user still exists in ACCOUNTS
        if (ACCOUNTS[parsed.username]) {
          setUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    const account = ACCOUNTS[username];

    if (account && account.password === password) {
      const demoUser: DemoUser = {
        username,
        role: account.role,
        fullName: account.fullName,
      };
      setUser(demoUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
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
