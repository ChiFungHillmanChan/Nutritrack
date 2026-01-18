import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../../../constants/typography';

interface SocialSignUpButtonsProps {
  dividerText: string;
  onGoogleSignUp: () => void;
  onAppleSignUp: () => void;
  isLoading: boolean;
}

export function SocialSignUpButtons({
  dividerText,
  onGoogleSignUp,
  onAppleSignUp,
  isLoading,
}: SocialSignUpButtonsProps) {
  return (
    <>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{dividerText}</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={onGoogleSignUp}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-google" size={20} color={COLORS.text} />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={onAppleSignUp}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-apple" size={20} color={COLORS.text} />
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    height: 48,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
});
