"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(
  undefined
);

const STORAGE_KEY = "punchly_demo_mode";

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore toggle state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setIsDemoMode(true);
      }
    } catch {
      // Ignore storage errors
    }
    setHydrated(true);
  }, []);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      try {
        if (next) {
          localStorage.setItem(STORAGE_KEY, "true");
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // Prevent flash of wrong state during SSR/hydration
  if (!hydrated) {
    return (
      <DemoModeContext.Provider
        value={{ isDemoMode: false, toggleDemoMode: () => {} }}
      >
        {children}
      </DemoModeContext.Provider>
    );
  }

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}
