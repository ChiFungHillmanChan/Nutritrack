/**
 * Card Component
 *
 * Beautiful card components with consistent styling, shadows, and optional gradients.
 */

import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: keyof typeof SPACING | number;
  borderRadius?: keyof typeof RADIUS | number;
  onPress?: () => void;
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'lg',
  borderRadius = 'lg',
  onPress,
}: CardProps) {
  const paddingValue = typeof padding === 'number' ? padding : SPACING[padding];
  const radiusValue = typeof borderRadius === 'number' ? borderRadius : RADIUS[borderRadius];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.surface,
          ...SHADOWS.lg,
        };
      case 'outlined':
        return {
          backgroundColor: COLORS.surface,
          borderWidth: 1,
          borderColor: COLORS.border,
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          ...SHADOWS.md,
        };
      default:
        return {
          backgroundColor: COLORS.surface,
          ...SHADOWS.sm,
        };
    }
  };

  const cardStyle: ViewStyle = {
    borderRadius: radiusValue,
    padding: paddingValue,
    ...getVariantStyles(),
    ...style,
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15 });
        }}
        style={[cardStyle, animatedStyle]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

/**
 * Gradient Card with customizable gradient colors
 */
interface GradientCardProps {
  children: React.ReactNode;
  colors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
  padding?: keyof typeof SPACING | number;
  borderRadius?: keyof typeof RADIUS | number;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  onPress?: () => void;
}

export function GradientCard({
  children,
  colors = [COLORS.primary, COLORS.primaryDark],
  style,
  padding = 'lg',
  borderRadius = 'lg',
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  onPress,
}: GradientCardProps) {
  const paddingValue = typeof padding === 'number' ? padding : SPACING[padding];
  const radiusValue = typeof borderRadius === 'number' ? borderRadius : RADIUS[borderRadius];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[
        {
          borderRadius: radiusValue,
          padding: paddingValue,
          ...SHADOWS.md,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15 });
        }}
        style={animatedStyle}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

/**
 * Section Card with title and optional action
 */
interface SectionCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SectionCard({ title, action, children, style }: SectionCardProps) {
  return (
    <Card style={style}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitle}>
          <View style={styles.sectionDot} />
          <Animated.Text style={styles.sectionTitleText}>{title}</Animated.Text>
        </View>
        {action}
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  sectionTitleText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
});
