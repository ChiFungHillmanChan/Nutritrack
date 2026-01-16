import { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore, calculateAge } from '../../stores/userStore';
import { useFoodStore } from '../../stores/foodStore';
import {
  CircularProgress,
  Card,
  GradientCard,
  NutritionBadge,
  Button,
  EnergyBalanceCharts,
  MacroDistributionChart,
} from '../../components/ui';
import { calculateEnergyBalance } from '../../lib/energy-calculator';
import type { ExerciseLog } from '../../types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, isAuthenticated } = useUserStore();
  const { todayLogs, todayNutrition, fetchTodayLogs, isLoading } = useFoodStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  // Fetch today's logs
  useEffect(() => {
    if (user?.id) {
      fetchTodayLogs(user.id);
    }
  }, [user?.id, fetchTodayLogs]);

  const handleRefresh = useCallback(() => {
    if (user?.id) {
      fetchTodayLogs(user.id);
    }
  }, [user?.id, fetchTodayLogs]);

  // Calculate energy balance
  const energyBalance = useMemo(() => {
    if (!user?.daily_targets) return null;

    const age = user.date_of_birth 
      ? calculateAge(user.date_of_birth)
      : 30;

    // TODO: Get from exerciseStore when implemented
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

  // Note: calculateMacroPercentages is available for future trend analysis

  if (!user) {
    return null;
  }

  const targets = user.daily_targets;

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
      {/* Header with Greeting */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()}，{user.name ?? '用戶'}
          </Text>
          <Text style={styles.date}>{formatDate(new Date())}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {user.name?.charAt(0).toUpperCase() ?? 'U'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Net Flow Card */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <GradientCard
          colors={['#10B981', '#059669']}
          style={styles.mainCard}
        >
          <View style={styles.mainCardContent}>
            <View style={styles.mainCardLeft}>
              <Text style={styles.mainCardLabel}>今日淨熱量</Text>
              <View style={styles.mainCardValueRow}>
                <Text style={styles.mainCardValue}>
                  {energyBalance?.remaining_quota ?? Math.round((targets?.calories.max ?? 2000) - todayNutrition.calories)}
                </Text>
                <Text style={styles.mainCardUnit}>kcal</Text>
              </View>
              <Text style={styles.mainCardSubtext}>
                剩餘配額
              </Text>
            </View>
            <View style={styles.mainCardRight}>
              <CircularProgress
                value={todayNutrition.calories}
                max={targets?.calories.max ?? 2000}
                size={110}
                strokeWidth={12}
                color="#FFFFFF"
                backgroundColor="rgba(255,255,255,0.3)"
                showValue={false}
                showPercentage
                animated
              />
            </View>
          </View>
        </GradientCard>
      </Animated.View>

      {/* Energy Balance Charts (3 Pie Charts) */}
      <Animated.View entering={FadeInDown.delay(250).springify()}>
        <Card style={styles.energyCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>能量平衡</Text>
            </View>
          </View>
          <EnergyBalanceCharts
            intake={Math.round(todayNutrition.calories)}
            burned={energyBalance?.total_burn ?? Math.round((targets?.calories.max ?? 2000) * 0.8)}
            target={targets?.calories.max ?? 2000}
            remaining={energyBalance?.remaining_quota ?? Math.round((targets?.calories.max ?? 2000) - todayNutrition.calories)}
          />
        </Card>
      </Animated.View>

      {/* Macro Distribution */}
      {(todayNutrition.protein > 0 || todayNutrition.carbs > 0 || todayNutrition.fat > 0) && (
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Card style={styles.macroCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionDot, { backgroundColor: COLORS.protein }]} />
                <Text style={styles.sectionTitle}>宏量營養素分佈</Text>
              </View>
            </View>
            <MacroDistributionChart
              protein={todayNutrition.protein}
              carbs={todayNutrition.carbs}
              fat={todayNutrition.fat}
              size={100}
              style={styles.macroChart}
            />
          </Card>
        </Animated.View>
      )}

      {/* Nutrition Stats */}
      <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.nutritionSection}>
        <Text style={styles.nutritionSectionTitle}>營養素攝取</Text>
        <View style={styles.nutritionGrid}>
          <NutritionBadge
            type="protein"
            value={todayNutrition.protein}
            max={targets?.protein.max ?? 100}
            variant="detailed"
            style={styles.nutritionItem}
          />
          <NutritionBadge
            type="carbs"
            value={todayNutrition.carbs}
            max={targets?.carbs.max ?? 250}
            variant="detailed"
            style={styles.nutritionItem}
          />
          <NutritionBadge
            type="fat"
            value={todayNutrition.fat}
            max={targets?.fat.max ?? 65}
            variant="detailed"
            style={styles.nutritionItem}
          />
          <NutritionBadge
            type="fiber"
            value={todayNutrition.fiber}
            max={targets?.fiber.max ?? 30}
            variant="detailed"
            style={styles.nutritionItem}
          />
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/(tabs)/camera')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.caloriesBg, '#FFF7ED']}
            style={styles.quickActionGradient}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.calories + '20' }]}>
              <Ionicons name="camera" size={24} color={COLORS.calories} />
            </View>
            <Text style={styles.quickActionTitle}>記錄食物</Text>
            <Text style={styles.quickActionSubtitle}>影相分析營養</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/(tabs)/chat')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.proteinBg, '#F5F3FF']}
            style={styles.quickActionGradient}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.protein + '20' }]}>
              <Ionicons name="chatbubbles" size={24} color={COLORS.protein} />
            </View>
            <Text style={styles.quickActionTitle}>問 AI</Text>
            <Text style={styles.quickActionSubtitle}>營養建議</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Today's Meals */}
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <Card style={styles.mealsCard}>
          <View style={styles.mealsHeader}>
            <View style={styles.mealsTitleRow}>
              <View style={styles.mealsTitleDot} />
              <Text style={styles.mealsTitle}>今日記錄</Text>
            </View>
            {todayLogs.length > 0 && (
              <Text style={styles.mealsCount}>{todayLogs.length} 項</Text>
            )}
          </View>

          {todayLogs.length > 0 ? (
            <View style={styles.mealsList}>
              {todayLogs.map((log, index) => (
                <Animated.View
                  key={log.id}
                  entering={FadeInRight.delay(index * 100)}
                  style={styles.mealItem}
                >
                  <View style={[styles.mealIcon, { backgroundColor: getMealColor(log.meal_type) + '15' }]}>
                    <Ionicons
                      name={getMealIcon(log.meal_type)}
                      size={18}
                      color={getMealColor(log.meal_type)}
                    />
                  </View>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealType}>{getMealTypeLabel(log.meal_type)}</Text>
                    <Text style={styles.mealName} numberOfLines={1}>{log.food_name}</Text>
                  </View>
                  <View style={styles.mealStats}>
                    <Text style={styles.mealCalories}>
                      {Math.round(log.nutrition_data.calories)}
                    </Text>
                    <Text style={styles.mealCaloriesUnit}>kcal</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="restaurant-outline" size={40} color={COLORS.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>今日未有記錄</Text>
              <Text style={styles.emptySubtitle}>
                影張食物相開始追蹤營養
              </Text>
              <Button
                title="記錄第一餐"
                icon="camera"
                onPress={() => router.push('/(tabs)/camera')}
                gradient
                style={styles.emptyButton}
              />
            </View>
          )}
        </Card>
      </Animated.View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// Helper Functions
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '早晨';
  if (hour < 18) return '午安';
  return '晚上好';
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };
  return date.toLocaleDateString('zh-HK', options);
}

function getMealTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '小食',
  };
  return labels[type] ?? type;
}

function getMealIcon(type: string): keyof typeof Ionicons.glyphMap {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    breakfast: 'sunny',
    lunch: 'partly-sunny',
    dinner: 'moon',
    snack: 'cafe',
  };
  return icons[type] ?? 'restaurant';
}

function getMealColor(type: string): string {
  const colors: Record<string, string> = {
    breakfast: COLORS.calories,
    lunch: COLORS.carbs,
    dinner: COLORS.protein,
    snack: COLORS.fat,
  };
  return colors[type] ?? COLORS.primary;
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
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  date: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  avatarButton: {
    ...SHADOWS.md,
    borderRadius: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textInverse,
  },

  // Main Card
  mainCard: {
    marginBottom: SPACING.lg,
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainCardLeft: {
    flex: 1,
  },
  mainCardLabel: {
    ...TYPOGRAPHY.overline,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.xs,
  },
  mainCardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mainCardValue: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: -1,
  },
  mainCardUnit: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: SPACING.xs,
  },
  mainCardSubtext: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: SPACING.xs,
  },
  mainCardRight: {
    marginLeft: SPACING.lg,
  },

  // Energy Card
  energyCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },

  // Macro Card
  macroCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  macroChart: {
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },

  // Nutrition Section
  nutritionSection: {
    marginBottom: SPACING.lg,
  },
  nutritionSectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  nutritionItem: {
    flex: 1,
    minWidth: (width - SPACING.lg * 2 - SPACING.sm) / 2 - 1,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  quickActionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  quickActionTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  quickActionSubtitle: {
    ...TYPOGRAPHY.caption,
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
  mealsList: {
    gap: SPACING.sm,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  mealType: {
    ...TYPOGRAPHY.overline,
    color: COLORS.primary,
    marginBottom: 2,
  },
  mealName: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  mealStats: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    ...TYPOGRAPHY.h4,
    color: COLORS.calories,
  },
  mealCaloriesUnit: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    minWidth: 160,
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING['2xl'],
  },
});
