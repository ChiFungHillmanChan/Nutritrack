/**
 * Habits Tab Screen
 *
 * Grid of trackable habits with quick-log functionality.
 */

import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { useHabitStore } from '../../stores/habitStore';
import { useTranslation } from '../../hooks/useTranslation';
import type { HabitType, MoodLevel, BristolStoolType } from '../../types';
import {
  HabitCard,
  HabitSummary,
  HabitInputModal,
  type HabitConfig,
} from './habits/components';
import { HABIT_CONFIGS } from './habits/config';

export default function HabitsScreen() {
  const { user } = useUserStore();
  const {
    todayLogs,
    fetchTodayLogs,
    isLoading,
    logHydration,
    logMood,
    logFiveADay,
    logSleep,
    logWeight,
    logBowels,
    getTodayHydration,
  } = useHabitStore();
  const { t } = useTranslation();

  const [selectedHabit, setSelectedHabit] = useState<HabitConfig | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

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

  const handleQuickAdd = useCallback(
    async (habit: HabitConfig, value: number) => {
      if (!user?.id) return;

      switch (habit.type) {
        case 'hydration':
          await logHydration(user.id, value);
          break;
        case 'five_a_day':
          await logFiveADay(user.id, value);
          break;
      }
    },
    [user?.id, logHydration, logFiveADay]
  );

  const openHabitModal = (habit: HabitConfig) => {
    setSelectedHabit(habit);
    setInputValue('');
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedHabit(null);
  };

  const handleLogHabit = async () => {
    if (!user?.id || !selectedHabit) return;

    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      Alert.alert(t('common.error'), t('habits.invalidNumber'));
      return;
    }

    let isSuccessful = false;
    switch (selectedHabit.type) {
      case 'hydration':
        isSuccessful = await logHydration(user.id, value);
        break;
      case 'sleep_duration':
        isSuccessful = await logSleep(user.id, value);
        break;
      case 'weight':
        isSuccessful = await logWeight(user.id, value);
        break;
      case 'five_a_day':
        isSuccessful = await logFiveADay(user.id, value);
        break;
      default:
        Alert.alert(t('common.error'), t('habits.notSupported'));
    }

    if (isSuccessful) {
      closeModal();
    }
  };

  const handleMoodSelect = async (mood: MoodLevel) => {
    if (!user?.id) return;
    await logMood(user.id, mood);
    closeModal();
  };

  const handleBowelSelect = async (type: BristolStoolType) => {
    if (!user?.id) return;
    await logBowels(user.id, type);
    closeModal();
  };

  const getHabitValue = (habitType: HabitType): number | string => {
    if (habitType === 'hydration') {
      return getTodayHydration();
    }
    const log = todayLogs.find((logEntry) => logEntry.habit_type === habitType);
    return log?.value ?? 0;
  };

  const getHabitProgress = (habit: HabitConfig): number => {
    const value = Number(getHabitValue(habit.type)) || 0;
    const max = habit.maxValue || 100;
    return Math.min((value / max) * 100, 100);
  };

  const getHabitLabel = (habit: HabitConfig): string => t(habit.labelKey);
  const getHabitUnit = (habit: HabitConfig): string | undefined =>
    habit.unitKey ? t(habit.unitKey) : undefined;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>{t('habits.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('habits.subtitle')}</Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Habit Grid */}
        <View style={styles.habitGrid}>
          {HABIT_CONFIGS.map((habit, index) => (
            <Animated.View
              key={habit.type}
              entering={FadeInDown.delay(index * 100).springify()}
              style={styles.habitCardContainer}
            >
              <HabitCard
                habit={habit}
                label={getHabitLabel(habit)}
                unit={getHabitUnit(habit)}
                value={getHabitValue(habit.type)}
                progress={getHabitProgress(habit)}
                onPress={() => openHabitModal(habit)}
                onQuickAdd={habit.quickAdd ? (quickValue) => handleQuickAdd(habit, quickValue) : undefined}
              />
            </Animated.View>
          ))}
        </View>

        {/* Today's Summary */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <HabitSummary todayLogs={todayLogs} habitConfigs={HABIT_CONFIGS} />
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Input Modal */}
      <HabitInputModal
        isVisible={isModalVisible}
        selectedHabit={selectedHabit}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onClose={closeModal}
        onSubmit={handleLogHabit}
        onMoodSelect={handleMoodSelect}
        onBowelSelect={handleBowelSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    ...SHADOWS.lg,
  },
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  habitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  habitCardContainer: {
    width: '47%',
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
