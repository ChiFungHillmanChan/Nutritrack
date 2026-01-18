/**
 * GoalsStep - Collects primary goal and additional health goals
 */

import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { SPACING } from '../../../../constants/typography';
import { Card } from '../../../../components/ui';
import { styles } from '../styles';
import type {
  UserGoal,
  HealthGoal,
  PrimaryGoalOption,
  HealthGoalOption,
  TranslationFunction,
} from '../types';

interface GoalsStepProps {
  primaryGoal: UserGoal | null;
  setPrimaryGoal: (value: UserGoal) => void;
  healthGoals: HealthGoal[];
  handleHealthGoalToggle: (goal: HealthGoal) => void;
  t: TranslationFunction;
  primaryGoals: PrimaryGoalOption[];
  healthGoalOptions: HealthGoalOption[];
}

export function GoalsStep({
  primaryGoal,
  setPrimaryGoal,
  healthGoals,
  handleHealthGoalToggle,
  t,
  primaryGoals,
  healthGoalOptions,
}: GoalsStepProps) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.calories, COLORS.caloriesBg]} style={styles.stepIconGradient}>
            <Ionicons name="trophy" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.goals.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.goals.description')}</Text>
      </View>

      {/* Primary Goal */}
      <Text style={styles.sectionLabel}>{t('onboarding.goals.primaryGoal')}</Text>
      <View style={styles.goalsGrid}>
        {primaryGoals.map((item, index) => (
          <Animated.View key={item.value} entering={FadeInRight.delay(index * 100)}>
            <TouchableOpacity
              style={[
                styles.goalCard,
                primaryGoal === item.value && styles.goalCardSelected,
                primaryGoal === item.value && { borderColor: item.color },
              ]}
              onPress={() => setPrimaryGoal(item.value)}
              activeOpacity={0.8}
            >
              <View style={[styles.goalIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.goalContent}>
                <Text style={[styles.goalLabel, primaryGoal === item.value && { color: item.color }]}>
                  {item.label}
                </Text>
                <Text style={styles.goalDesc}>{item.desc}</Text>
              </View>
              {primaryGoal === item.value && (
                <View style={[styles.goalCheck, { backgroundColor: item.color }]}>
                  <Ionicons name="checkmark" size={14} color={COLORS.textInverse} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Additional Health Goals */}
      <Text style={[styles.sectionLabel, { marginTop: SPACING.xl }]}>{t('onboarding.goals.additionalGoals')}</Text>
      <Card style={styles.conditionsCard}>
        <View style={styles.conditionsGrid}>
          {healthGoalOptions.map((item, index) => (
            <Animated.View key={item.value} entering={FadeInRight.delay(index * 30)}>
              <TouchableOpacity
                style={[
                  styles.conditionChip,
                  healthGoals.includes(item.value) && styles.conditionChipSelected,
                ]}
                onPress={() => handleHealthGoalToggle(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={healthGoals.includes(item.value) ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.conditionText,
                    healthGoals.includes(item.value) && styles.conditionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}
