import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  gradientStyle: 'default' | 'loveable';
  setGradientStyle: (style: 'default' | 'loveable') => void;
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
  
  const [gradientStyle, setGradientStyleState] = useState<'default' | 'loveable'>(() => {
    const saved = localStorage.getItem('gradientStyle');
    return (saved as 'default' | 'loveable') || 'default';
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
    // Save gradient style to localStorage
    localStorage.setItem('gradientStyle', gradientStyle);
  }, [gradientStyle]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const setGradientStyle = (style: 'default' | 'loveable') => {
    setGradientStyleState(style);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, gradientStyle, setGradientStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};