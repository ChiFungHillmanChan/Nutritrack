import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { useFoodStore } from '../../stores/foodStore';
import { Ionicons } from '@expo/vector-icons';

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
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          {getGreeting()}，{user.name ?? '用戶'}！
        </Text>
        <Text style={styles.dateText}>{formatDate(new Date())}</Text>
      </View>

      {/* Main Progress Card */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>今日攝取</Text>
        
        {/* Calories Progress */}
        <View style={styles.caloriesContainer}>
          <View style={styles.caloriesInfo}>
            <Text style={styles.caloriesValue}>{Math.round(todayNutrition.calories)}</Text>
            <Text style={styles.caloriesUnit}>/ {targets?.calories.max ?? 2000} kcal</Text>
          </View>
          <ProgressBar
            value={todayNutrition.calories}
            max={targets?.calories.max ?? 2000}
            color={COLORS.calories}
          />
        </View>

        {/* Macros Grid */}
        <View style={styles.macrosGrid}>
          <MacroCard
            label="蛋白質"
            value={todayNutrition.protein}
            max={targets?.protein.max ?? 100}
            unit="g"
            color={COLORS.protein}
          />
          <MacroCard
            label="碳水"
            value={todayNutrition.carbs}
            max={targets?.carbs.max ?? 250}
            unit="g"
            color={COLORS.carbs}
          />
          <MacroCard
            label="脂肪"
            value={todayNutrition.fat}
            max={targets?.fat.max ?? 65}
            unit="g"
            color={COLORS.fat}
          />
          <MacroCard
            label="纖維"
            value={todayNutrition.fiber}
            max={targets?.fiber.max ?? 30}
            unit="g"
            color={COLORS.fiber}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push('/(tabs)/camera')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.successLight }]}>
            <Ionicons name="camera" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionText}>記錄食物</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push('/(tabs)/chat')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.infoLight }]}>
            <Ionicons name="chatbubbles" size={24} color={COLORS.info} />
          </View>
          <Text style={styles.quickActionText}>問 AI</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Meals */}
      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>今日記錄</Text>
        {todayLogs.length > 0 ? (
          todayLogs.map((log) => (
            <View key={log.id} style={styles.mealCard}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealType}>{getMealTypeLabel(log.meal_type)}</Text>
                <Text style={styles.mealName}>{log.food_name}</Text>
                <Text style={styles.mealCalories}>
                  {Math.round(log.nutrition_data.calories)} kcal
                </Text>
              </View>
              <Text style={styles.mealTime}>
                {formatTime(new Date(log.logged_at))}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>今日未有記錄</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/camera')}
            >
              <Text style={styles.emptyButtonText}>記錄第一餐</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Helper Components
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
}

function MacroCard({
  label,
  value,
  max,
  unit,
  color,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <View style={styles.macroCard}>
      <View style={styles.macroHeader}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
      <Text style={styles.macroValue}>
        {Math.round(value)}<Text style={styles.macroUnit}>/{max}{unit}</Text>
      </Text>
      <View style={styles.macroProgressContainer}>
        <View style={[styles.macroProgressFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: 16,
  },
  greeting: {
    marginBottom: 20,
  },
  greetingText: {
    ...TYPOGRAPHY.h2,
  },
  dateText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  progressTitle: {
    ...TYPOGRAPHY.h4,
    marginBottom: 16,
  },
  caloriesContainer: {
    marginBottom: 20,
  },
  caloriesInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.calories,
  },
  caloriesUnit: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  macroLabel: {
    ...TYPOGRAPHY.caption,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  macroUnit: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'normal',
  },
  macroProgressContainer: {
    height: 4,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    ...TYPOGRAPHY.label,
  },
  mealsSection: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    marginBottom: 16,
  },
  mealCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  mealName: {
    ...TYPOGRAPHY.body,
    marginVertical: 2,
  },
  mealCalories: {
    ...TYPOGRAPHY.caption,
  },
  mealTime: {
    ...TYPOGRAPHY.caption,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
});
