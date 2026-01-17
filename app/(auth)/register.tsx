import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { signUpWithEmail, signInWithGoogle, signInWithApple } from '../../services/auth';
import { useTranslation } from '../../hooks/useTranslation';

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return t('auth.register.passwordTooShort');
    }
    if (!/[A-Z]/.test(pwd)) {
      return t('auth.register.passwordNeedsUppercase');
    }
    if (!/[0-9]/.test(pwd)) {
      return t('auth.register.passwordNeedsNumber');
    }
    return null;
  };

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('common.error'), t('auth.register.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.register.passwordMismatch'));
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert(t('auth.register.passwordNotStrong'), passwordError);
      return;
    }

    setIsLoading(true);
    const result = await signUpWithEmail(email, password);
    setIsLoading(false);

    if (result.success) {
      Alert.alert(t('auth.register.registerSuccess'), t('auth.register.checkEmail'), [
        { text: t('common.ok'), onPress: () => router.replace('/(auth)/onboarding') },
      ]);
    } else {
      Alert.alert(t('auth.register.registerFailed'), result.error ?? t('auth.login.tryAgain'));
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();
    setIsLoading(false);

    if (result.success) {
      // Social sign-in auto-creates the account, go to onboarding
      router.replace('/(auth)/onboarding');
    } else if (result.error !== '登入已取消') {
      Alert.alert(t('auth.register.registerFailed'), result.error ?? t('auth.login.tryAgain'));
    }
  };

  const handleAppleSignUp = async () => {
    setIsLoading(true);
    const result = await signInWithApple();
    setIsLoading(false);

    if (result.success) {
      // Social sign-in auto-creates the account, go to onboarding
      router.replace('/(auth)/onboarding');
    } else if (result.error !== '登入已取消') {
      Alert.alert(t('auth.register.registerFailed'), result.error ?? t('auth.login.tryAgain'));
    }
  };

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background */}
        <LinearGradient
          colors={[COLORS.primaryMuted, COLORS.backgroundSecondary]}
          style={styles.backgroundGradient}
        />

        {/* Header */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.iconGradient}>
                <Ionicons name="person-add" size={24} color={COLORS.textInverse} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>{t('auth.register.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
          </View>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formSection}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('auth.register.email')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.emailPlaceholder')}
                placeholderTextColor={COLORS.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('auth.register.password')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.passwordPlaceholder')}
                placeholderTextColor={COLORS.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
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
              text={t('auth.register.requirements.minLength')}
              met={passwordChecks.length}
            />
            <PasswordRequirement
              text={t('auth.register.requirements.uppercase')}
              met={passwordChecks.uppercase}
            />
            <PasswordRequirement
              text={t('auth.register.requirements.number')}
              met={passwordChecks.number}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('auth.register.confirmPassword')}</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                placeholderTextColor={COLORS.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
              {confirmPassword.length > 0 && (
                <Ionicons
                  name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={password === confirmPassword ? COLORS.success : COLORS.error}
                />
              )}
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
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
                  <Text style={styles.registerButtonText}>{t('auth.register.registerButton')}</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.textInverse} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.login.orUse')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign Up Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color={COLORS.text} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleAppleSignUp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={20} color={COLORS.text} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            {t('auth.register.terms')}{' '}
            <Text style={styles.termsLink}>{t('auth.register.termsOfService')}</Text> {t('auth.register.and')}{' '}
            <Text style={styles.termsLink}>{t('settings.privacyPolicy')}</Text>
          </Text>
        </Animated.View>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.loginText}>{t('auth.register.haveAccount')}</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>{t('auth.register.loginNow')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PasswordRequirement({ text, met }: { text: string; met: boolean }) {
  return (
    <View style={styles.requirement}>
      <View style={[styles.requirementIcon, met && styles.requirementIconMet]}>
        <Ionicons
          name={met ? 'checkmark' : 'ellipse'}
          size={met ? 12 : 6}
          color={met ? COLORS.textInverse : COLORS.textTertiary}
        />
      </View>
      <Text style={[styles.requirementText, met && styles.requirementMet]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING['3xl'],
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
  },

  // Header
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

  // Form
  formSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
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

  // Requirements
  requirements: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
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

  // Button
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

  // Divider
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

  // Social Buttons
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

  // Terms
  termsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  loginText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  loginLink: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
});
