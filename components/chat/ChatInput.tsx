/**
 * ChatInput Component
 *
 * Input area for composing and sending chat messages,
 * with a gradient send button that activates when text is entered.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, GRADIENTS, SHADOWS } from '../../constants/colors';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/typography';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
  placeholder: string;
  inputAccessibilityLabel: string;
  inputAccessibilityHint: string;
  sendAccessibilityLabel: string;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  isLoading,
  placeholder,
  inputAccessibilityLabel,
  inputAccessibilityHint,
  sendAccessibilityLabel,
}: ChatInputProps) {
  const isSendDisabled = !value.trim() || isLoading;
  const hasContent = value.trim() && !isLoading;

  return (
    <View style={styles.inputWrapper}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textTertiary}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={500}
          accessibilityLabel={inputAccessibilityLabel}
          accessibilityHint={inputAccessibilityHint}
        />
        <TouchableOpacity
          style={[styles.sendButton, isSendDisabled && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={isSendDisabled}
          activeOpacity={0.8}
          accessibilityLabel={sendAccessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: isSendDisabled }}
        >
          {hasContent ? (
            <LinearGradient colors={GRADIENTS.primary} style={styles.sendButtonGradient}>
              <Ionicons name="send" size={18} color={COLORS.textInverse} />
            </LinearGradient>
          ) : (
            <View style={styles.sendButtonInactive}>
              <Ionicons name="send" size={18} color={COLORS.textMuted} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  sendButton: {
    marginLeft: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.colored(COLORS.primary),
  },
  sendButtonInactive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundTertiary,
  },
  sendButtonDisabled: {
    opacity: 1,
  },
});
