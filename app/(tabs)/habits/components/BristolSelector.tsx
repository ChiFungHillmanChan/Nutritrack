/**
 * BristolSelector Component
 *
 * A scrollable list for selecting Bristol stool type.
 */

import { Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../../../constants/typography';
import { useTranslation } from '../../../../hooks/useTranslation';
import type { BristolStoolType } from '../../../../types';

interface BristolOption {
  label: string;
  description: string;
}

interface BristolSelectorProps {
  onSelect: (type: BristolStoolType) => void;
}

export function BristolSelector({ onSelect }: BristolSelectorProps) {
  const { t } = useTranslation();

  const bristolTypes: Record<BristolStoolType, BristolOption> = {
    1: { label: t('habits.bristol.type1'), description: t('habits.bristol.type1Desc') },
    2: { label: t('habits.bristol.type2'), description: t('habits.bristol.type2Desc') },
    3: { label: t('habits.bristol.type3'), description: t('habits.bristol.type3Desc') },
    4: { label: t('habits.bristol.type4'), description: t('habits.bristol.type4Desc') },
    5: { label: t('habits.bristol.type5'), description: t('habits.bristol.type5Desc') },
    6: { label: t('habits.bristol.type6'), description: t('habits.bristol.type6Desc') },
    7: { label: t('habits.bristol.type7'), description: t('habits.bristol.type7Desc') },
  };

  const bristolTypeValues: BristolStoolType[] = [1, 2, 3, 4, 5, 6, 7];

  return (
    <ScrollView style={styles.bristolList}>
      {bristolTypeValues.map((type) => (
        <TouchableOpacity
          key={type}
          style={styles.bristolItem}
          onPress={() => onSelect(type)}
          accessibilityLabel={`${bristolTypes[type].label}: ${bristolTypes[type].description}`}
          accessibilityRole="button"
        >
          <Text style={styles.bristolLabel}>{bristolTypes[type].label}</Text>
          <Text style={styles.bristolDescription}>{bristolTypes[type].description}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bristolList: {
    maxHeight: 300,
  },
  bristolItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  bristolLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  bristolDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
