/**
 * AnalyzeButton - AI analysis trigger button
 *
 * Displays a button to trigger food analysis with AI,
 * showing loading state during analysis.
 */

import { Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

interface AnalyzeButtonProps {
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export function AnalyzeButton({ isAnalyzing, onAnalyze }: AnalyzeButtonProps) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <TouchableOpacity
        style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
        onPress={onAnalyze}
        disabled={isAnalyzing}
        activeOpacity={0.9}
        accessibilityLabel={isAnalyzing ? t('camera.analyzing') : t('camera.analyzeButton')}
        accessibilityRole="button"
        accessibilityState={{ disabled: isAnalyzing }}
        accessibilityHint={t('accessibility.analyzeImageWithAI')}
      >
        <LinearGradient
          colors={isAnalyzing ? [COLORS.textMuted, COLORS.textTertiary] : GRADIENTS.primary}
          style={styles.analyzeButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator color={COLORS.textInverse} size="small" />
              <Text style={styles.analyzeButtonText}>{t('camera.analyzing')}</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={22} color={COLORS.textInverse} />
              <Text style={styles.analyzeButtonText}>{t('camera.analyzeButton')}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  analyzeButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.colored(COLORS.primary),
  },
  analyzeButtonDisabled: {
    ...SHADOWS.sm,
  },
  analyzeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  analyzeButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: COLORS.textInverse,
  },
});
