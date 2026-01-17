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

import { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore, calculateAge } from '../../stores/userStore';
import { useFoodStore } from '../../stores/foodStore';
import { useHabitStore } from '../../stores/habitStore';
import { useTranslation } from '../../hooks/useTranslation';
import {
  CircularProgress,
  Card,
  NutrientProgressBars,
} from '../../components/ui';
import { DailyQuote } from '../../components/home';
import { calculateEnergyBalance } from '../../lib/energy-calculator';
import type { ExerciseLog } from '../../types';


export default function HomeScreen() {
  const { user, isAuthenticated } = useUserStore();
  const { todayLogs, todayNutrition, fetchTodayLogs, isLoading } = useFoodStore();
  const { todayHabits, fetchTodayHabits } = useHabitStore();
  const { t } = useTranslation();

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

  // Calculate energy balance (prepared for future use)
  const _energyBalance = useMemo(() => {
    if (!user?.daily_targets) return null;

    const age = user.date_of_birth 
      ? calculateAge(user.date_of_birth)
      : 30;

    const exercises: ExerciseLog[] = [];
    const steps = 0;

    return calculateEnergyBalance({
      weightKg: user.weight_kg,
      heightCm: user.height_cm,
      age,
      gender: user.gender || 'prefer_not_to_say',
      activityLevel: user.activity_level || 'moderate',
      caloriesConsumed: todayNutrition.calories,
      exercises,
      steps,
      dailyTargets: user.daily_targets,
    });
  }, [user, todayNutrition.calories]);

  // Calculate BMI
  const bmi = useMemo(() => {
    if (!user?.weight_kg || !user?.height_cm) return null;
    const heightM = user.height_cm / 100;
    return (user.weight_kg / (heightM * heightM)).toFixed(1);
  }, [user?.weight_kg, user?.height_cm]);

  // Calculate remaining percentage
  const remainingPercentage = useMemo(() => {
    if (!user?.daily_targets) return 100;
    const max = user.daily_targets.calories.max;
    const consumed = todayNutrition.calories;
    const remaining = Math.max(0, ((max - consumed) / max) * 100);
    return Math.round(remaining);
  }, [user?.daily_targets, todayNutrition.calories]);

  // Get hydration from habit logs
  const todayHydration = useMemo(() => {
    const hydrationLog = todayHabits.find(h => h.habit_type === 'hydration');
    return hydrationLog ? Number(hydrationLog.value) : 0;
  }, [todayHabits]);

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
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {t('home.greeting', { name: user.name ?? t('home.userDefault') })}
          </Text>
          <Text style={styles.userStats}>
            {user.weight_kg}{t('units.kg')} • {user.height_cm}{t('units.cm')} • BMI {bmi}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.dateLabel}>{dateStr}</Text>
          <Text style={styles.dayCount}>
            {t('home.day')} {Math.floor((today.getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) + 1}
          </Text>
        </View>
      </Animated.View>

      {/* Today's Intake Card */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Card style={styles.intakeCard}>
          <Text style={styles.intakeTitle}>{t('home.todayIntake')}</Text>
          
          <View style={styles.intakeContent}>
            {/* Left: Circular Progress */}
            <View style={styles.progressContainer}>
              <CircularProgress
                value={todayNutrition.calories}
                max={targets?.calories.max ?? 2000}
                size={140}
                strokeWidth={14}
                color={COLORS.primary}
                backgroundColor={COLORS.backgroundTertiary}
                showValue={false}
                animated
              />
              <View style={styles.progressOverlay}>
                <Text style={styles.progressPercentage}>{remainingPercentage}%</Text>
                <Text style={styles.progressLabel}>{t('common.left')}</Text>
              </View>
            </View>

            {/* Right: Nutrient Bars */}
            <View style={styles.nutrientBarsContainer}>
              <NutrientProgressBars
                carbs={todayNutrition.carbs}
                carbsMax={targets?.carbs.max ?? 250}
                protein={todayNutrition.protein}
                proteinMax={targets?.protein.max ?? 100}
                fiber={todayNutrition.fiber}
                fiberMax={targets?.fiber.max ?? 30}
                fat={todayNutrition.fat}
                fatMax={targets?.fat.max ?? 65}
                sugar={todayNutrition.sugar ?? 0}
                sugarMax={50}
                fluids={todayHydration}
                fluidsMax={targets?.water ?? 2000}
                labels={{
                  carbs: t('nutrients.carbs'),
                  protein: t('nutrients.protein'),
                  fiber: t('nutrients.fiber'),
                  fat: t('nutrients.fat'),
                  sugar: t('nutrients.sugar'),
                  fluids: t('nutrients.fluids'),
                }}
              />
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Record Intake Button */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => router.push('/(tabs)/camera')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            style={styles.recordButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.recordButtonText}>{t('home.recordIntake')}</Text>
            <View style={styles.recordButtonIcon}>
              <Ionicons name="camera" size={20} color={COLORS.primary} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Daily Quote */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <DailyQuote style={styles.quoteCard} />
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/(tabs)/chat')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.proteinBg }]}>
            <Ionicons name="chatbubbles" size={24} color={COLORS.protein} />
          </View>
          <Text style={styles.quickActionTitle}>{t('home.askAI')}</Text>
          <Text style={styles.quickActionSubtitle}>{t('home.nutritionAdvice')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/(tabs)/habits')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.fiberBg }]}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.fiber} />
          </View>
          <Text style={styles.quickActionTitle}>{t('home.habits')}</Text>
          <Text style={styles.quickActionSubtitle}>{t('home.trackRecord')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/wellness/meditation' as never)}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.caloriesBg }]}>
            <Ionicons name="leaf" size={24} color={COLORS.calories} />
          </View>
          <Text style={styles.quickActionTitle}>{t('home.meditation')}</Text>
          <Text style={styles.quickActionSubtitle}>{t('home.relaxMind')}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Today's Meals Summary */}
      {todayLogs.length > 0 && (
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Card style={styles.mealsCard}>
            <View style={styles.mealsHeader}>
              <View style={styles.mealsTitleRow}>
                <View style={styles.mealsTitleDot} />
                <Text style={styles.mealsTitle}>{t('home.todayRecord')}</Text>
              </View>
              <Text style={styles.mealsCount}>{todayLogs.length} {t('common.items')}</Text>
            </View>

            <View style={styles.mealsSummary}>
              <View style={styles.mealSummaryItem}>
                <Text style={styles.mealSummaryValue}>
                  {Math.round(todayNutrition.calories)}
                </Text>
                <Text style={styles.mealSummaryLabel}>{t('units.kcal')}</Text>
              </View>
              <View style={styles.mealSummaryDivider} />
              <View style={styles.mealSummaryItem}>
                <Text style={styles.mealSummaryValue}>
                  {Math.round(todayNutrition.protein)}{t('units.g')}
                </Text>
                <Text style={styles.mealSummaryLabel}>{t('onboarding.nutrients.protein')}</Text>
              </View>
              <View style={styles.mealSummaryDivider} />
              <View style={styles.mealSummaryItem}>
                <Text style={styles.mealSummaryValue}>
                  {Math.round(todayNutrition.carbs)}{t('units.g')}
                </Text>
                <Text style={styles.mealSummaryLabel}>{t('onboarding.nutrients.carbs')}</Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      )}

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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userStats: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  dayCount: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },

  // Intake Card
  intakeCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  intakeTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  intakeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  nutrientBarsContainer: {
    flex: 1,
    marginLeft: SPACING.lg,
  },

  // Record Button
  recordButton: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  recordButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  recordButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.textInverse,
    marginRight: SPACING.sm,
  },
  recordButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quote Card
  quoteCard: {
    marginBottom: SPACING.lg,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.text,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
  },

  // Meals Card
  mealsCard: {
    padding: SPACING.lg,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealsTitleDot: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  mealsTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  mealsCount: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.backgroundTertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  mealsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  mealSummaryItem: {
    alignItems: 'center',
  },
  mealSummaryValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  mealSummaryLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
  },
  mealSummaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING['2xl'],
  },
});
