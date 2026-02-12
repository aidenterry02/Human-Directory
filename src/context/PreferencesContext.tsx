/**
 * Context for managing app preferences/settings
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface PreferencesContextType {
  notificationTime: { hour: number; minute: number };
  setNotificationTime: (hour: number, minute: number) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const PREFERENCES_KEY = '@preferences';
const DEFAULT_NOTIFICATION_TIME = { hour: 9, minute: 0 };

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notificationTime, setNotificationTimeState] = useState(DEFAULT_NOTIFICATION_TIME);
  const [loaded, setLoaded] = useState(false);

  // Load preferences on app startup
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.notificationTime) {
          setNotificationTimeState(prefs.notificationTime);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoaded(true);
    }
  };

  const setNotificationTime = async (hour: number, minute: number) => {
    try {
      const newTime = { hour, minute };
      setNotificationTimeState(newTime);
      
      const prefs = {
        notificationTime: newTime,
      };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  };

  const value: PreferencesContextType = {
    notificationTime,
    setNotificationTime,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {loaded && children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
