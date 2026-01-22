/**
 * NutritionBreakdownScreen - Detailed nutrition vs RNI comparison
 *
 * Shows today's intake of all macro and micronutrients
 * compared against Recommended Nutrient Intake (RNI).
 */

import { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { useTranslation } from '../hooks/useTranslation';
import { useUserStore } from '../stores/userStore';
import { useFoodStore } from '../stores/foodStore';
import { Card, ProgressBar } from '../components/ui';
import { RNI_VALUES, CATEGORIES, NutrientRNI } from '../constants/rni';

export default function NutritionBreakdownScreen() {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { todayLogs, fetchTodayLogs, isLoading } = useFoodStore();

  // Fetch today's logs on mount
  useEffect(() => {
    if (user?.id) {
      fetchTodayLogs(user.id);
    }
  }, [user?.id, fetchTodayLogs]);

  // Calculate today's totals from food logs
  const todayTotals = useMemo(() => {
    const totals: Record<string, number> = {
      calories: 0,
      protein: 0,
      totalCarbs: 0,
      dietaryFiber: 0,
      saturatedFat: 0,
      unsaturatedFat: 0,
      sodium: 0,
      totalSugars: 0,
      // Set default 0 for all nutrients that we don't have data for
    };

    todayLogs.forEach((log) => {
      if (log.nutrition_data) {
        totals.calories += log.nutrition_data.calories || 0;
        totals.protein += log.nutrition_data.protein || 0;
        totals.totalCarbs += log.nutrition_data.carbs || 0;
        totals.dietaryFiber += log.nutrition_data.fiber || 0;
        // Approximate fat distribution
        const totalFat = log.nutrition_data.fat || 0;
        totals.saturatedFat += totalFat * 0.35; // Estimate
        totals.unsaturatedFat += totalFat * 0.65; // Estimate
        totals.sodium += log.nutrition_data.sodium || 0;
        totals.totalSugars += log.nutrition_data.sugar || 0;
      }
    });

    return totals;
  }, [todayLogs]);

  // Get intake value for a nutrient
  const getIntakeValue = (nutrientId: string): number => {
    return todayTotals[nutrientId] || 0;
  };

  // Calculate percentage of RNI
  const getPercentage = (intake: number, rni: number): number => {
    if (rni === 0) return intake > 0 ? 100 : 0;
    return Math.min((intake / rni) * 100, 150); // Cap at 150%
  };

  // Get color based on percentage
  const getProgressColor = (percentage: number, nutrientId: string): string => {
    // Trans fat is special - any amount is bad
    if (nutrientId === 'transFat') {
      return percentage > 0 ? COLORS.error : COLORS.success;
    }
    // For most nutrients, closer to 100% is better
    if (percentage < 50) return COLORS.warning;
    if (percentage <= 120) return COLORS.success;
    return COLORS.error;
  };

  // Group nutrients by category
  const groupedNutrients = useMemo(() => {
    const groups: Record<string, NutrientRNI[]> = {
      macros: [],
      fats: [],
      carbs: [],
      micros: [],
    };

    RNI_VALUES.forEach((nutrient) => {
      groups[nutrient.category].push(nutrient);
    });

    return groups;
  }, []);

  const renderNutrientRow = (nutrient: NutrientRNI, index: number) => {
    const intake = getIntakeValue(nutrient.id);
    const percentage = getPercentage(intake, nutrient.value);
    const color = getProgressColor(percentage, nutrient.id);

    return (
      <Animated.View
        key={nutrient.id}
        entering={FadeInDown.delay(index * 30).springify()}
        style={styles.nutrientRow}
      >
        <View style={styles.nutrientHeader}>
          <Text style={styles.nutrientName}>{t(nutrient.labelKey)}</Text>
          <View style={styles.nutrientValues}>
            <Text style={[styles.intakeValue, { color }]}>
              {Math.round(intake)}
            </Text>
            <Text style={styles.separator}>/</Text>
            <Text style={styles.rniValue}>
              {nutrient.value === 0 ? t('rni.avoid') : nutrient.value}
            </Text>
            <Text style={styles.unit}>{nutrient.unit}</Text>
          </View>
        </View>
        <ProgressBar
          value={percentage}
          max={100}
          color={color}
          height={6}
        />
      </Animated.View>
    );
  };

  const renderCategory = (categoryKey: string, nutrients: NutrientRNI[], delay: number) => {
    return (
      <Animated.View
        key={categoryKey}
        entering={FadeInDown.delay(delay).springify()}
      >
        <Card style={styles.categoryCard}>
          <Text style={styles.categoryTitle}>
            {t(CATEGORIES[categoryKey as keyof typeof CATEGORIES].labelKey)}
          </Text>
          <View style={styles.nutrientsList}>
            {nutrients.map((nutrient, index) => renderNutrientRow(nutrient, index))}
          </View>
        </Card>
      </Animated.View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('rni.title'),
          headerBackTitle: t('common.back'),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn}>
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <Ionicons name="nutrition" size={32} color={COLORS.textInverse} />
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>{t('rni.title')}</Text>
                  <Text style={styles.headerSubtitle}>{t('rni.subtitle')}</Text>
                </View>
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.legendText}>{t('rni.intake')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.5)' }]} />
                  <Text style={styles.legendText}>{t('rni.recommended')}</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          )}

          {/* Nutrient Categories */}
          {renderCategory('macros', groupedNutrients.macros, 100)}
          {renderCategory('fats', groupedNutrients.fats, 200)}
          {renderCategory('carbs', groupedNutrients.carbs, 300)}
          {renderCategory('micros', groupedNutrients.micros, 400)}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['3xl'],
  },
  header: {
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textInverse,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.8)',
  },
  legendRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  categoryCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  categoryTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  nutrientsList: {
    gap: SPACING.md,
  },
  nutrientRow: {
    gap: SPACING.xs,
  },
  nutrientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  nutrientValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  intakeValue: {
    ...TYPOGRAPHY.labelMedium,
  },
  separator: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  rniValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  unit: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
    marginLeft: 2,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
