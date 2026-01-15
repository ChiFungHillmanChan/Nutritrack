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
} from 'react-native';
import { Link, router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { signInWithEmail, signInWithGoogle, signInWithApple } from '../../services/auth';
import { useUserStore } from '../../stores/userStore';
import { isDemoMode } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const enterDemoMode = useUserStore((state) => state.enterDemoMode);
  const isInDemoMode = isDemoMode();

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
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="nutrition" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Nutritrack</Text>
          <Text style={styles.subtitle}>追蹤你嘅營養攝取</Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
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

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="密碼"
            placeholderTextColor={COLORS.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.buttonDisabled]}
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.textInverse} />
          ) : (
            <Text style={styles.loginButtonText}>登入</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>或者</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} disabled={isLoading}>
            <Ionicons name="logo-google" size={20} color={COLORS.text} />
            <Text style={styles.socialButtonText}>Google 登入</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin} disabled={isLoading}>
              <Ionicons name="logo-apple" size={20} color={COLORS.text} />
              <Text style={styles.socialButtonText}>Apple 登入</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>未有帳戶？</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>註冊</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Demo Mode Button */}
        {isInDemoMode && (
          <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
            <Ionicons name="flask-outline" size={20} color={COLORS.warning} />
            <Text style={styles.demoButtonText}>示範模式（無需 Supabase）</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    marginHorizontal: 16,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  socialButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  registerLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: 12,
    height: 50,
    marginTop: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  demoButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.warning,
  },
});
