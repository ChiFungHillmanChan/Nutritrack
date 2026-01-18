/**
 * DietaryStep - Collects dietary preferences and allergies
 */

import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SPACING } from '../../../constants/typography';
import { Card } from '../../ui';
import { styles } from '../styles';
import type { DietaryPreference, DietaryPrefOption, TranslationFunction } from '../types';

interface DietaryStepProps {
  dietaryPrefs: DietaryPreference[];
  handleDietaryPrefToggle: (pref: DietaryPreference) => void;
  allergies: string[];
  newAllergy: string;
  setNewAllergy: (value: string) => void;
  addAllergy: () => void;
  removeAllergy: (allergy: string) => void;
  t: TranslationFunction;
  dietaryPrefOptions: DietaryPrefOption[];
}

export function DietaryStep({
  dietaryPrefs,
  handleDietaryPrefToggle,
  allergies,
  newAllergy,
  setNewAllergy,
  addAllergy,
  removeAllergy,
  t,
  dietaryPrefOptions,
}: DietaryStepProps) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={[COLORS.carbs, COLORS.carbsBg]} style={styles.stepIconGradient}>
            <Ionicons name="restaurant" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.dietary.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.dietary.description')}</Text>
      </View>

      {/* Dietary Preferences */}
      <Text style={styles.sectionLabel}>{t('onboarding.dietary.dietaryWays')}</Text>
      <Card style={styles.conditionsCard}>
        <View style={styles.conditionsGrid}>
          {dietaryPrefOptions.map((item, index) => (
            <Animated.View key={item.value} entering={FadeInRight.delay(index * 30)}>
              <TouchableOpacity
                style={[
                  styles.conditionChip,
                  dietaryPrefs.includes(item.value) && styles.conditionChipSelected,
                ]}
                onPress={() => handleDietaryPrefToggle(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={dietaryPrefs.includes(item.value) ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.conditionText,
                    dietaryPrefs.includes(item.value) && styles.conditionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Card>

      {/* Allergies */}
      <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>{t('onboarding.dietary.allergies')}</Text>
      <Card style={styles.formCard}>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.input, styles.addItemInput]}
            placeholder={t('onboarding.dietary.allergyPlaceholder')}
            placeholderTextColor={COLORS.textTertiary}
            value={newAllergy}
            onChangeText={setNewAllergy}
            onSubmitEditing={addAllergy}
          />
          <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        {allergies.length > 0 && (
          <View style={styles.allergiesList}>
            {allergies.map((allergy) => (
              <View key={allergy} style={styles.allergyChip}>
                <Text style={styles.allergyText}>{allergy}</Text>
                <TouchableOpacity onPress={() => removeAllergy(allergy)}>
                  <Ionicons name="close" size={16} color={COLORS.textInverse} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Animated.View>
  );
}
