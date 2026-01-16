/**
 * Button Component
 *
 * A versatile button component with multiple variants, sizes, and animations.
 */

import {
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, RADIUS, SPACING } from '../../constants/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  gradient?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  gradient = false,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
    opacity.value = withSpring(0.9, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withSpring(1, { damping: 15 });
  };

  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant);

  const isDisabled = disabled || loading;
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || gradient ? COLORS.textInverse : COLORS.primary}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={variantStyles.text.color as string}
              style={styles.iconLeft}
            />
          )}
          <Text style={[sizeStyles.text, variantStyles.text]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={variantStyles.text.color as string}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </>
  );

  // Gradient button
  if (gradient && variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            sizeStyles.button,
            styles.gradientButton,
          ]}
        >
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.button,
        sizeStyles.button,
        variantStyles.button,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {content}
    </AnimatedPressable>
  );
}

/**
 * Icon Button for compact icon-only actions
 */
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: ButtonSize;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'ghost',
  disabled = false,
  style,
}: IconButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 26 : 22;
  const buttonSize = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.backgroundTertiary;
      default:
        return 'transparent';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.textInverse;
      case 'secondary':
        return COLORS.text;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      disabled={disabled}
      style={[
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: getBackgroundColor(),
          alignItems: 'center',
          justifyContent: 'center',
        },
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={getIconColor()} />
    </AnimatedPressable>
  );
}

function getSizeStyles(size: ButtonSize): { button: ViewStyle; text: TextStyle } {
  switch (size) {
    case 'sm':
      return {
        button: {
          height: 40,
          paddingHorizontal: SPACING.md,
          borderRadius: RADIUS.md,
        },
        text: TYPOGRAPHY.buttonSmall,
      };
    case 'lg':
      return {
        button: {
          height: 56,
          paddingHorizontal: SPACING['2xl'],
          borderRadius: RADIUS.lg,
        },
        text: TYPOGRAPHY.buttonLarge,
      };
    default:
      return {
        button: {
          height: 48,
          paddingHorizontal: SPACING.lg,
          borderRadius: RADIUS.md,
        },
        text: TYPOGRAPHY.button,
      };
  }
}

function getVariantStyles(variant: ButtonVariant): { button: ViewStyle; text: TextStyle } {
  switch (variant) {
    case 'secondary':
      return {
        button: {
          backgroundColor: COLORS.backgroundTertiary,
        },
        text: {
          color: COLORS.text,
        },
      };
    case 'outline':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: COLORS.border,
        },
        text: {
          color: COLORS.text,
        },
      };
    case 'ghost':
      return {
        button: {
          backgroundColor: 'transparent',
        },
        text: {
          color: COLORS.primary,
        },
      };
    case 'destructive':
      return {
        button: {
          backgroundColor: COLORS.errorLight,
        },
        text: {
          color: COLORS.error,
        },
      };
    default:
      return {
        button: {
          backgroundColor: COLORS.primary,
          ...SHADOWS.sm,
        },
        text: {
          color: COLORS.textInverse,
        },
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButton: {
    ...SHADOWS.colored(COLORS.primary),
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});
