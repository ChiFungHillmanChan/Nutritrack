/**
 * Home Screen - Redesigned
 *
 * Main dashboard with:
 * - User greeting and stats
 * - Circular progress for remaining quota
 * - Horizontal nutrition bars
 * - Record Intake button
 * - Daily motivational quote
 */

import { router } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DailyQuote } from '../../components/home';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/typography';
import { useFoodStore } from '../../stores/foodStore';
import { useHabitStore } from '../../stores/habitStore';
import { useUserStore } from '../../stores/userStore';
import {
  HomeHeader,
  IntakeCard,
  MealsSummary,
  QuickActions,
  RecordIntakeButton,
} from './home/components';

export default function HomeScreen() {
  const { user, isAuthenticated } = useUserStore();
  const { todayLogs, todayNutrition, fetchTodayLogs, isLoading } = useFoodStore();
  const { todayHabits, fetchTodayHabits } = useHabitStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  // Fetch today's data
  useEffect(() => {
    if (user?.id) {
      fetchTodayLogs(user.id);
      fetchTodayHabits(user.id);
    }
  }, [user?.id, fetchTodayLogs, fetchTodayHabits]);

  const handleRefresh = useCallback(() => {
    if (user?.id) {
      fetchTodayLogs(user.id);
      fetchTodayHabits(user.id);
    }
  }, [user?.id, fetchTodayLogs, fetchTodayHabits]);

  // Calculate BMI
  const bmi = useMemo(() => {
    if (!user?.weight_kg || !user?.height_cm) return null;
    const heightInMeters = user.height_cm / 100;
    return (user.weight_kg / (heightInMeters * heightInMeters)).toFixed(1);
  }, [user?.weight_kg, user?.height_cm]);

  // Calculate remaining percentage
  const remainingPercentage = useMemo(() => {
    if (!user?.daily_targets) return 100;
    const maxCalories = user.daily_targets.calories.max;
    const consumedCalories = todayNutrition.calories;
    const remainingRatio = Math.max(0, ((maxCalories - consumedCalories) / maxCalories) * 100);
    return Math.round(remainingRatio);
  }, [user?.daily_targets, todayNutrition.calories]);

  // Get hydration from habit logs
  const todayHydration = useMemo(() => {
    const hydrationLog = todayHabits.find((habit) => habit.habit_type === 'hydration');
    return hydrationLog ? Number(hydrationLog.value) : 0;
  }, [todayHabits]);

  // Calculate days since account creation
  const daysSinceCreation = useMemo(() => {
    if (!user?.created_at) return 1;
    const today = new Date();
    const createdDate = new Date(user.created_at);
    return Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [user?.created_at]);

  if (!user) {
    return null;
  }

  const targets = user.daily_targets;
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* User Info Header */}
      <HomeHeader
        userName={user.name}
        weightKg={user.weight_kg}
        heightCm={user.height_cm}
        bmi={bmi}
        dateStr={dateStr}
        daysSinceCreation={daysSinceCreation}
      />

      {/* Today's Intake Card */}
      <IntakeCard
        todayNutrition={todayNutrition}
        targets={targets}
        remainingPercentage={remainingPercentage}
        todayHydration={todayHydration}
      />

      {/* Record Intake Button */}
      <RecordIntakeButton />

      {/* Daily Quote */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <DailyQuote style={styles.quoteCard} />
      </Animated.View>

      {/* Quick Actions */}
      <QuickActions />

      {/* Today's Meals Summary */}
      <MealsSummary todayLogs={todayLogs} todayNutrition={todayNutrition} />

      {/* Bottom spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  quoteCard: {
    marginBottom: SPACING.lg,
  },
  bottomSpacer: {
    height: SPACING['2xl'],
  },
});
