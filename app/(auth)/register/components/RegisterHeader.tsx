import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../../../constants/typography';

const { height: screenHeight } = Dimensions.get('window');

interface RegisterHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

export function RegisterHeader({ title, subtitle, onBack }: RegisterHeaderProps) {
  return (
    <>
      <LinearGradient
        colors={[COLORS.primaryMuted, COLORS.backgroundSecondary]}
        style={styles.backgroundGradient}
      />
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.iconGradient}>
              <Ionicons name="person-add" size={24} color={COLORS.textInverse} />
            </LinearGradient>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.35,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING['2xl'],
    marginBottom: SPACING['2xl'],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});
