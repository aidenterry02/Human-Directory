/**
 * Context for managing dark mode state globally
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

const DARK_MODE_KEY = '@dark_mode_enabled';

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load dark mode preference on app startup
  useEffect(() => {
    loadDarkModePreference();
  }, []);

  const loadDarkModePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (stored !== null) {
        setIsDarkMode(stored === 'true');
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
    } finally {
      setLoaded(true);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem(DARK_MODE_KEY, newValue ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
      throw error;
    }
  };

  const value: DarkModeContextType = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <DarkModeContext.Provider value={value}>
      {loaded && children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = (): DarkModeContextType => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};
