import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../constants/typography';

interface PasswordRequirementProps {
  text: string;
  isMet: boolean;
}

export function PasswordRequirement({ text, isMet }: PasswordRequirementProps) {
  return (
    <View style={styles.requirement}>
      <View style={[styles.requirementIcon, isMet && styles.requirementIconMet]}>
        <Ionicons
          name={isMet ? 'checkmark' : 'ellipse'}
          size={isMet ? 12 : 6}
          color={isMet ? COLORS.textInverse : COLORS.textTertiary}
        />
      </View>
      <Text style={[styles.requirementText, isMet && styles.requirementMet]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  requirementIconMet: {
    backgroundColor: COLORS.success,
  },
  requirementText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
  },
  requirementMet: {
    color: COLORS.success,
  },
});
