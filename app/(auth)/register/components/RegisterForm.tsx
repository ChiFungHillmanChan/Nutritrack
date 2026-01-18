import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../../../constants/typography';
import { PasswordRequirement } from './PasswordRequirement';
import type { PasswordChecks } from '../utils/validatePassword';

interface RegisterFormTranslations {
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  registerButton: string;
  requirements: {
    minLength: string;
    uppercase: string;
    number: string;
  };
}

interface RegisterFormProps {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  showPassword: boolean;
  passwordChecks: PasswordChecks;
  translations: RegisterFormTranslations;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onRegister: () => void;
}

export function RegisterForm({
  email,
  password,
  confirmPassword,
  isLoading,
  showPassword,
  passwordChecks,
  translations,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onRegister,
}: RegisterFormProps) {
  const isPasswordMatch = password === confirmPassword;

  return (
    <>
      {/* Email Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{translations.email}</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={translations.emailPlaceholder}
            placeholderTextColor={COLORS.textTertiary}
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{translations.password}</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={translations.passwordPlaceholder}
            placeholderTextColor={COLORS.textTertiary}
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={onTogglePassword} style={styles.eyeIcon}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Requirements */}
      <View style={styles.requirements}>
        <PasswordRequirement
          text={translations.requirements.minLength}
          isMet={passwordChecks.hasMinLength}
        />
        <PasswordRequirement
          text={translations.requirements.uppercase}
          isMet={passwordChecks.hasUppercase}
        />
        <PasswordRequirement
          text={translations.requirements.number}
          isMet={passwordChecks.hasNumber}
        />
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{translations.confirmPassword}</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={translations.confirmPasswordPlaceholder}
            placeholderTextColor={COLORS.textTertiary}
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            secureTextEntry={!showPassword}
          />
          {confirmPassword.length > 0 && (
            <Ionicons
              name={isPasswordMatch ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={isPasswordMatch ? COLORS.success : COLORS.error}
            />
          )}
        </View>
      </View>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.registerButton, isLoading && styles.buttonDisabled]}
        onPress={onRegister}
        disabled={isLoading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.registerButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.textInverse} />
          ) : (
            <>
              <Text style={styles.registerButtonText}>{translations.registerButton}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.textInverse} />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    height: 52,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  requirements: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  registerButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.sm,
    ...SHADOWS.colored(COLORS.primary),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: SPACING.sm,
  },
  registerButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
});
