/**
 * Main App component with navigation setup
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StatusBar, Text } from 'react-native';
import { DarkModeProvider, useDarkMode } from './src/context/DarkModeContext';
import { PeopleProvider } from './src/context/PeopleContext';
import { PreferencesProvider, usePreferences } from './src/context/PreferencesContext';
import { AddPersonScreen } from './src/screens/AddPersonScreen';
import { ContactHistoryScreen } from './src/screens/ContactHistoryScreen';
import { EditPersonScreen } from './src/screens/EditPersonScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PersonDetailsScreen } from './src/screens/PersonDetailsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { RootStackParamList, RootTabParamList } from './src/screens/types';
import { scheduleDailyReminder, setupNotifications } from './src/utils/notificationUtils';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// Main stack for Home and Details
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PersonDetails" component={PersonDetailsScreen} />
      <Stack.Screen name="EditPerson" component={EditPersonScreen} />
      <Stack.Screen name="ContactHistory" component={ContactHistoryScreen} />
    </Stack.Navigator>
  );
};

// Root tab navigator
const RootTabs = () => {
  const { isDarkMode } = useDarkMode();

  const backgroundColor = isDarkMode ? '#1e1e1e' : '#fff';
  const borderColor = isDarkMode ? '#333333' : '#e8eef2';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: borderColor,
          backgroundColor,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#667EEA',
        tabBarInactiveTintColor: isDarkMode ? '#666' : '#b0b8c1',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          title: 'People',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="AddPerson"
        component={AddPersonScreen}
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>➕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Inner App component that uses dark mode and preferences context
const AppContent = () => {
  const { isDarkMode } = useDarkMode();
  const { notificationTime } = usePreferences();

  useEffect(() => {
    const setupAndSchedule = async () => {
      try {
        await setupNotifications();
        // Schedule with custom time when preferences are loaded
        await scheduleDailyReminder(notificationTime.hour, notificationTime.minute);
      } catch (error) {
        console.error('Error with notifications:', error);
      }
    };
    setupAndSchedule();
  }, [notificationTime]);

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0a0a0a' : '#fff'}
      />
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <PreferencesProvider>
      <DarkModeProvider>
        <PeopleProvider>
          <AppContent />
        </PeopleProvider>
      </DarkModeProvider>
    </PreferencesProvider>
  );
}
