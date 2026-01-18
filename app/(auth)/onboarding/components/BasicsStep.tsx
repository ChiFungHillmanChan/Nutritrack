/**
 * BasicsStep - Collects name, gender, and date of birth
 */

import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, GRADIENTS } from '../../../../constants/colors';
import { calculateAge } from '../../../../stores/userStore';
import { Card } from '../../../../components/ui';
import { styles } from '../styles';
import type { Gender, GenderOption, TranslationFunction } from '../types';

interface BasicsStepProps {
  name: string;
  setName: (value: string) => void;
  gender: Gender | null;
  setGender: (value: Gender) => void;
  dateOfBirth: Date;
  setDateOfBirth: (value: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (value: boolean) => void;
  t: TranslationFunction;
  language: string;
  genders: GenderOption[];
}

export function BasicsStep({
  name,
  setName,
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
  showDatePicker,
  setShowDatePicker,
  t,
  language,
  genders,
}: BasicsStepProps) {
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.stepIconGradient}>
            <Ionicons name="person" size={28} color={COLORS.textInverse} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>{t('onboarding.basics.title')}</Text>
        <Text style={styles.stepDescription}>{t('onboarding.basics.description')}</Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('onboarding.basics.name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('onboarding.basics.namePlaceholder')}
            placeholderTextColor={COLORS.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('onboarding.basics.gender')}</Text>
          <View style={styles.genderGrid}>
            {genders.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.genderChip,
                  gender === item.value && styles.genderChipSelected,
                ]}
                onPress={() => setGender(item.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={gender === item.value ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === item.value && styles.genderTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('onboarding.basics.dateOfBirth')}</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.dateButtonText}>
              {dateOfBirth.toLocaleDateString(language === 'zh-TW' ? 'zh-HK' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.ageText}>
              ({calculateAge(dateOfBirth.toISOString().split('T')[0])} {t('units.years')})
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                }
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
            />
          )}
        </View>
      </Card>
    </Animated.View>
  );
}
