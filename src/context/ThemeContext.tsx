import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [accentColor, setAccentColorState] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('accentColor');
    return saved || '#3B82F6'; // Default to blue
  });

  useEffect(() => {
    // Update document class instantly
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    // Update CSS variable for accent color
    document.documentElement.style.setProperty('--accent-color', accentColor);
    
    // Convert hex to RGB for opacity variations
    const hex = accentColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
    
    // Save to localStorage
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};