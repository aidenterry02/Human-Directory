/**
 * Notification utilities for setting up local notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Set up notification handler
export const setupNotifications = async () => {
  try {
    // Set the notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
};

export const scheduleDailyReminder = async (hour: number = 9, minute: number = 0) => {
  try {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to reconnect! 👋',
        body: 'Check if you need to reach out to anyone today.',
        data: { type: 'reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });

    // Save the last notification setup time
    await AsyncStorage.setItem('@last_notification_setup', new Date().toISOString());
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
  }
};

export const sendTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification from Human Directory',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
      },
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
};
