import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link, router } from 'expo-router';
import { COLORS, SHADOWS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { signUpWithEmail, signInWithGoogle, signInWithApple } from '../../services/auth';
import { useUserStore } from '../../stores/userStore';
import { useTranslation } from '../../hooks/useTranslation';
import { createLogger } from '../../lib/logger';
import { RegisterHeader, RegisterForm, SocialSignUpButtons } from '../../components/register';
import { validatePassword, getPasswordChecks } from '../../components/register/validatePassword';
import type { User } from '../../types';

const logger = createLogger('[Register]');

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('common.error'), t('auth.register.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.register.passwordMismatch'));
      return;
    }

    const passwordErrorKey = validatePassword(password);
    if (passwordErrorKey) {
      Alert.alert(t('auth.register.passwordNotStrong'), t(passwordErrorKey));
      return;
    }

    setIsLoading(true);
    const result = await signUpWithEmail(email, password);
    setIsLoading(false);

    if (result.success && result.userId) {
      // Auto-login: Set user in store after successful registration
      const { setUser } = useUserStore.getState();
      
      const newUser: Partial<User> = {
        id: result.userId,
        email: email,
        onboarding_completed: false,
      };
      
      setUser(newUser as User);
      
      // Show success message and navigate to onboarding
      Alert.alert(t('auth.register.registerSuccess'), t('auth.register.checkEmail'), [
        { text: t('common.ok'), onPress: () => router.replace('/(auth)/onboarding') },
      ]);
    } else if (result.success) {
      // Fallback if no userId returned
      Alert.alert(t('auth.register.registerSuccess'), t('auth.register.checkEmail'), [
        { text: t('common.ok'), onPress: () => router.replace('/(auth)/onboarding') },
      ]);
    } else {
      if (result.error === 'EMAIL_ALREADY_EXISTS') {
        Alert.alert(
          t('auth.register.emailAlreadyExistsTitle'),
          t('auth.register.emailAlreadyExists'),
          [
            { text: t('auth.register.loginNow'), onPress: () => router.replace('/(auth)/login') },
            { text: t('common.ok'), style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(t('auth.register.registerFailed'), result.error ?? t('auth.login.tryAgain'));
      }
    }
  };

  const handleGoogleSignUp = async () => {
    logger.debug('Google signup button pressed');
    setIsLoading(true);
    const startTime = Date.now();
    const result = await signInWithGoogle();
    logger.debug('Google signup completed:', Date.now() - startTime, 'ms');
    logger.debug('Google result:', { success: result.success, hasError: !!result.error });
    setIsLoading(false);

    if (result.success && result.userId) {
      // Set user in store with social metadata for pre-filling onboarding
      const { setUser } = useUserStore.getState();
      
      const newUser: Partial<User> = {
        id: result.userId,
        email: result.email ?? '',
        onboarding_completed: false,
        social_metadata: result.userMetadata ? {
          name: result.userMetadata.name,
          picture: result.userMetadata.picture,
        } : undefined,
      };
      
      setUser(newUser as User);
      
      logger.info('Navigating to onboarding...');
      router.replace('/(auth)/onboarding');
    } else if (result.error !== 'cancelled' && result.error !== '登入已取消') {
      Alert.alert(t('auth.register.registerFailed'), result.error ?? t('auth.login.tryAgain'));
    }
  };

  const handleAppleSignUp = async () => {
    logger.debug('Apple signup button pressed');
    setIsLoading(true);
    const startTime = Date.now();
    const result = await signInWithApple();
    logger.debug('Apple signup completed:', Date.now() - startTime, 'ms');
    logger.debug('Apple result:', { success: result.success, hasError: !!result.error });
    setIsLoading(false);

    if (result.success && result.userId) {
      // Set user in store with social metadata for pre-filling onboarding
      const { setUser } = useUserStore.getState();
      
      const newUser: Partial<User> = {
        id: result.userId,
        email: result.email ?? '',
        onboarding_completed: false,
        social_metadata: result.userMetadata ? {
          name: result.userMetadata.name,
          picture: result.userMetadata.picture,
        } : undefined,
      };
      
      setUser(newUser as User);
      
      logger.info('Navigating to onboarding...');
      router.replace('/(auth)/onboarding');
    } else if (result.error !== 'cancelled' && result.error !== '登入已取消') {
      Alert.alert(t('auth.register.registerFailed'), result.error ?? t('auth.login.tryAgain'));
    }
  };

  const passwordChecks = getPasswordChecks(password);

  const formTranslations = {
    email: t('auth.register.email'),
    emailPlaceholder: t('auth.register.emailPlaceholder'),
    password: t('auth.register.password'),
    passwordPlaceholder: t('auth.register.passwordPlaceholder'),
    confirmPassword: t('auth.register.confirmPassword'),
    confirmPasswordPlaceholder: t('auth.register.confirmPasswordPlaceholder'),
    registerButton: t('auth.register.registerButton'),
    requirements: {
      minLength: t('auth.register.requirements.minLength'),
      uppercase: t('auth.register.requirements.uppercase'),
      number: t('auth.register.requirements.number'),
    },
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
        <RegisterHeader
          title={t('auth.register.title')}
          subtitle={t('auth.register.subtitle')}
          onBack={() => router.back()}
        />

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formSection}>
          <RegisterForm
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            isLoading={isLoading}
            showPassword={showPassword}
            passwordChecks={passwordChecks}
            translations={formTranslations}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onRegister={handleRegister}
          />

          <SocialSignUpButtons
            dividerText={t('auth.login.orUse')}
            onGoogleSignUp={handleGoogleSignUp}
            onAppleSignUp={handleAppleSignUp}
            isLoading={isLoading}
          />

          <Text style={styles.termsText}>
            {t('auth.register.terms')}{' '}
            <Text style={styles.termsLink}>{t('auth.register.termsOfService')}</Text>{' '}
            {t('auth.register.and')}{' '}
            <Text style={styles.termsLink}>{t('settings.privacyPolicy')}</Text>
          </Text>
        </Animated.View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING['3xl'],
  },
  formSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
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
