/**
 * ConditionsStep - Collects medical conditions
 */

import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { Card } from '../../../../components/ui';
import { styles } from '../styles';
import type { MedicalCondition, ConditionOption, TranslationFunction } from '../types';

interface ConditionsStepProps {
  conditions: MedicalCondition[];
  handleConditionToggle: (condition: MedicalCondition) => void;
  t: TranslationFunction;
  conditionOptions: ConditionOption[];
}

export function ConditionsStep({
  conditions,
  handleConditionToggle,
  t,
  conditionOptions,
}: ConditionsStepProps) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.protein, COLORS.fat]} style={styles.stepIconGradient}>
            <Ionicons name="medical" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.conditions.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.conditions.description')}</Text>
      </View>

      <Card style={styles.conditionsCard}>
        <View style={styles.conditionsGrid}>
          {conditionOptions.map((item, index) => (
            <Animated.View key={item.value} entering={FadeInRight.delay(index * 30)}>
              <TouchableOpacity
                style={[
                  styles.conditionChip,
                  conditions.includes(item.value) && styles.conditionChipSelected,
                ]}
                onPress={() => handleConditionToggle(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={conditions.includes(item.value) ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.conditionText,
                    conditions.includes(item.value) && styles.conditionTextSelected,
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
