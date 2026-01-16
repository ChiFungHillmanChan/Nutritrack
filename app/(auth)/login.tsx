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
  FadeInUp,
} from 'react-native-reanimated';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { signInWithEmail, signInWithGoogle, signInWithApple } from '../../services/auth';
import { useUserStore } from '../../stores/userStore';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const enterDemoMode = useUserStore((state) => state.enterDemoMode);

  const handleDemoLogin = () => {
    enterDemoMode();
    router.replace('/(tabs)');
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('錯誤', '請填寫電郵同密碼');
      return;
    }

    setIsLoading(true);
    const result = await signInWithEmail(email, password);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('登入失敗', result.error ?? '請再試一次');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('登入失敗', result.error ?? '請再試一次');
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    const result = await signInWithApple();
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('登入失敗', result.error ?? '請再試一次');
    }
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
        {/* Background Gradient */}
        <LinearGradient
          colors={[COLORS.primaryMuted, COLORS.backgroundSecondary]}
          style={styles.backgroundGradient}
        />

        {/* Logo Section */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.logoGradient}>
              <Ionicons name="nutrition" size={44} color={COLORS.textInverse} />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>Nutritrack</Text>
          <Text style={styles.tagline}>追蹤營養，活出健康</Text>
        </Animated.View>

        {/* Login Form */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formSection}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="電郵地址"
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
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="密碼"
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

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>忘記密碼？</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleEmailLogin}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.textInverse} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>登入</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.textInverse} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>或者使用</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color={COLORS.text} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleAppleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={20} color={COLORS.text} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Register Link */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.footer}>
          <Text style={styles.registerText}>未有帳戶？</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>立即註冊</Text>
            </TouchableOpacity>
          </Link>
        </Animated.View>

        {/* Demo Mode - Always show for easy testing */}
        <Animated.View entering={FadeInUp.delay(500)}>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoLogin}
            activeOpacity={0.8}
          >
            <View style={styles.demoIconContainer}>
              <Ionicons name="flask-outline" size={18} color={COLORS.warning} />
            </View>
            <Text style={styles.demoButtonText}>示範模式（無需登入）</Text>
          </TouchableOpacity>
        </Animated.View>
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
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['3xl'],
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    paddingTop: height * 0.12,
    marginBottom: SPACING['3xl'],
  },
  logoContainer: {
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    ...TYPOGRAPHY.display,
    color: COLORS.primary,
    letterSpacing: -1,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Form Section
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  inputWrapper: {
    marginBottom: SPACING.md,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    ...TYPOGRAPHY.bodySmallMedium,
    color: COLORS.primary,
  },
  loginButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.colored(COLORS.primary),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: SPACING.sm,
  },
  loginButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
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

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  registerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  registerLink: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },

  // Demo Mode
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.lg,
    height: 48,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  demoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonText: {
    ...TYPOGRAPHY.bodySmallMedium,
    color: COLORS.warning,
  },
});
