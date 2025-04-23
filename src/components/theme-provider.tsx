/*
  ThemeProvider component and hook implementation for React.
  - Manages a 'dark' or 'light' theme state.
  - Persists theme choice in localStorage.
  - Applies the current theme as a class on the HTML document root.
  - Exports a context provider and a custom hook for consuming the theme.
*/
// All comments made in the file were done by OpenAI's o4-mini model

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeProviderProps {
  children: React.ReactNode;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Create a React context with default theme state and no-op setter
const ThemeContext = createContext<ThemeProviderState>({
  theme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  // Initialize theme state from localStorage, fallback to 'light'
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || 'light',
  );

  // Effect to update the <html> element's class when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Setter that updates both localStorage and React state
  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  // Provide the current theme and setter function to descendants
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

// Custom hook to access theme context; throws if used outside provider
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be inside a ThemeProvider');
  }
  return ctx;
}
