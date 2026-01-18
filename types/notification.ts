/**
 * Notification types for Nutritrack
 */

import type { HabitType } from './activity';

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface MedicationReminder {
  medication_id: string;
  name: string;
  enabled: boolean;
  time: string; // Single time for simple scheduling
  times?: string[]; // Multiple times for complex schedules
}

export interface SupplementReminder {
  supplement_id: string;
  name: string;
  enabled: boolean;
  time: string;
  times?: string[];
}

export interface HabitReminder {
  habit_type: HabitType;
  name: string;
  enabled: boolean;
  time: string;
}

export interface NotificationSettings {
  meal_reminders: {
    breakfast: { enabled: boolean; time: string };
    lunch: { enabled: boolean; time: string };
    dinner: { enabled: boolean; time: string };
  };
  water_reminder: {
    enabled: boolean;
    interval_hours: number;
  };
  weight_reminder: {
    enabled: boolean;
    day_of_week: number;  // 0-6, Sunday = 0
    time: string;
  };
  medication_reminders: MedicationReminder[];
  supplement_reminders: SupplementReminder[];
  habit_reminders: HabitReminder[];
  goal_nudges: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
  };
}
