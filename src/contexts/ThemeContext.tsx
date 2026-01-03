/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark';
export type ThemeName = 'aurora' | 'ocean' | 'sunset' | 'forest';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeValue] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) return stored;
    if (typeof globalThis !== 'undefined' && globalThis.window) {
      return globalThis.window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  const [themeName, setThemeNameValue] = useState<ThemeName>(() => {
    const stored = localStorage.getItem('themeName') as ThemeName | null;
    return stored || 'aurora';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Apply dark/light mode
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply theme variant (aurora, ocean, sunset, forest)
    root.classList.remove(
      'theme-aurora',
      'theme-ocean',
      'theme-sunset',
      'theme-forest'
    );
    if (themeName !== 'aurora') {
      root.classList.add(`theme-${themeName}`);
    }

    localStorage.setItem('theme', theme);
    localStorage.setItem('themeName', themeName);
  }, [theme, themeName]);

  const toggleTheme = () => {
    setThemeValue((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeValue(newTheme);
  };

  const setThemeName = (name: ThemeName) => {
    setThemeNameValue(name);
  };

  const value = useMemo(
    () => ({
      theme,
      themeName,
      toggleTheme,
      setTheme,
      setThemeName,
    }),
    [theme, themeName]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
