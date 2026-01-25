/**
 * MetricsStep - Collects height, weight, and activity level
 */

import { View, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { Card } from '../../ui';
import { styles } from '../styles';
import type { ActivityLevel, ActivityLevelOption, TranslationFunction } from '../types';

interface MetricsStepProps {
  height: string;
  setHeight: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  activityLevel: ActivityLevel;
  setActivityLevel: (value: ActivityLevel) => void;
  t: TranslationFunction;
  activityLevels: ActivityLevelOption[];
}

export function MetricsStep({
  height,
  setHeight,
  weight,
  setWeight,
  activityLevel: _activityLevel,
  setActivityLevel: _setActivityLevel,
  t,
  activityLevels: _activityLevels,
}: MetricsStepProps) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.carbs, COLORS.accentDark]} style={styles.stepIconGradient}>
            <Ionicons name="body" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.metrics.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.metrics.description')}</Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={styles.inputLabel}>{t('onboarding.metrics.height')}</Text>
            <View style={styles.unitInput}>
              <TextInput
                style={[styles.input, styles.unitInputField]}
                placeholder="170"
                placeholderTextColor={COLORS.textTertiary}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>{t('units.cm')}</Text>
            </View>
          </View>

          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={styles.inputLabel}>{t('onboarding.metrics.weight')}</Text>
            <View style={styles.unitInput}>
              <TextInput
                style={[styles.input, styles.unitInputField]}
                placeholder="65"
                placeholderTextColor={COLORS.textTertiary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>{t('units.kg')}</Text>
            </View>
          </View>
        </View>

        {/* Activity Level - Hidden for now per design spec */}
        {/* <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('onboarding.metrics.activityLevel')}</Text>
          <View style={styles.activityList}>
            {activityLevels.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.activityItem,
                  activityLevel === item.value && styles.activityItemSelected,
                ]}
                onPress={() => setActivityLevel(item.value)}
                activeOpacity={0.8}
              >
                <View style={styles.activityRadio}>
                  {activityLevel === item.value && (
                    <View style={styles.activityRadioInner} />
                  )}
                </View>
                <View style={styles.activityContent}>
                  <Text
                    style={[
                      styles.activityLabel,
                      activityLevel === item.value && styles.activityLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.activityDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}
      </Card>
    </Animated.View>
  );
}
