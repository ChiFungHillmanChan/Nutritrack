/**
 * Notification Service
 * 
 * Handles local push notifications for meal reminders,
 * water reminders, and weight tracking reminders.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  // For Android, create notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Nutritrack 通知',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22C55E',
    });
  }
  
  return true;
}

/**
 * Schedule meal reminder notifications
 */
export async function scheduleMealReminder(
  mealType: 'breakfast' | 'lunch' | 'dinner',
  hour: number,
  minute: number
): Promise<string | undefined> {
  const mealLabels = {
    breakfast: { title: '記得記錄早餐 🍳', body: '影張相記錄你食咗咩啦！' },
    lunch: { title: '記得記錄午餐 🍱', body: '午餐食咗咩？記錄低佢！' },
    dinner: { title: '記得記錄晚餐 🍽️', body: '晚餐時間到，記得記錄！' },
  };
  
  const content = mealLabels[mealType];
  
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  
  return identifier;
}

/**
 * Schedule water reminder notifications
 */
export async function scheduleWaterReminder(intervalHours: number): Promise<string | undefined> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '飲水時間 💧',
      body: '記得飲杯水，保持水分！',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: intervalHours * 60 * 60,
      repeats: true,
    },
  });
  
  return identifier;
}

/**
 * Schedule weekly weight reminder
 */
export async function scheduleWeightReminder(
  dayOfWeek: number,
  hour: number,
  minute: number
): Promise<string | undefined> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '每週磅重時間 ⚖️',
      body: '記錄你嘅體重，追蹤進度！',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: dayOfWeek + 1, // Expo uses 1-7 (Sunday = 1)
      hour,
      minute,
    },
  });
  
  return identifier;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Setup notifications based on user settings
 */
export async function setupNotifications(settings: NotificationSettings): Promise<void> {
  // Cancel existing notifications first
  await cancelAllNotifications();
  
  // Schedule meal reminders
  if (settings.meal_reminders.breakfast.enabled) {
    const [hour, minute] = settings.meal_reminders.breakfast.time.split(':').map(Number);
    await scheduleMealReminder('breakfast', hour, minute);
  }
  
  if (settings.meal_reminders.lunch.enabled) {
    const [hour, minute] = settings.meal_reminders.lunch.time.split(':').map(Number);
    await scheduleMealReminder('lunch', hour, minute);
  }
  
  if (settings.meal_reminders.dinner.enabled) {
    const [hour, minute] = settings.meal_reminders.dinner.time.split(':').map(Number);
    await scheduleMealReminder('dinner', hour, minute);
  }
  
  // Schedule water reminder
  if (settings.water_reminder.enabled) {
    await scheduleWaterReminder(settings.water_reminder.interval_hours);
  }
  
  // Schedule weight reminder
  if (settings.weight_reminder.enabled) {
    const [hour, minute] = settings.weight_reminder.time.split(':').map(Number);
    await scheduleWeightReminder(settings.weight_reminder.day_of_week, hour, minute);
  }
}

/**
 * Get default notification settings
 */
export function getDefaultNotificationSettings(): NotificationSettings {
  return {
    meal_reminders: {
      breakfast: { enabled: true, time: '08:00' },
      lunch: { enabled: true, time: '12:30' },
      dinner: { enabled: true, time: '19:00' },
    },
    water_reminder: {
      enabled: true,
      interval_hours: 2,
    },
    weight_reminder: {
      enabled: true,
      day_of_week: 0, // Sunday
      time: '09:00',
    },
  };
}
