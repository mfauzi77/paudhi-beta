import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

// FIX: Add a specific type for the context value and define props for ThemeProvider to fix type errors.
const ThemeContext = createContext<{ theme: string; toggleTheme: () => void; } | undefined>(undefined);

// Define props for ThemeProvider
interface ThemeProviderProps {
  // FIX: Made children optional to resolve a confusing TypeScript error where the prop is not being correctly identified from JSX.
  children?: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
        return 'light';
    }
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};