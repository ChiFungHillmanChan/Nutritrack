/**
 * Contact Us Screen
 * 
 * Contact information and feedback form.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { Card, Button } from '../components/ui';
import { useTranslation } from '../hooks/useTranslation';

interface ContactMethod {
  id: string;
  nameKey: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action: () => void;
}

export default function ContactScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactMethods: ContactMethod[] = [
    {
      id: 'email',
      nameKey: 'contact.email',
      value: 'support@nutritrack.app',
      icon: 'mail',
      color: COLORS.primary,
      action: () => Linking.openURL('mailto:support@nutritrack.app'),
    },
    {
      id: 'phone',
      nameKey: 'contact.phone',
      value: '+852 1234 5678',
      icon: 'call',
      color: COLORS.info,
      action: () => Linking.openURL('tel:+85212345678'),
    },
    {
      id: 'whatsapp',
      nameKey: 'contact.whatsapp',
      value: '+852 1234 5678',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => Linking.openURL('https://wa.me/85212345678'),
    },
    {
      id: 'instagram',
      nameKey: 'contact.instagram',
      value: '@nutritrack.hk',
      icon: 'logo-instagram',
      color: '#E4405F',
      action: () => Linking.openURL('https://instagram.com/nutritrack.hk'),
    },
  ];

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert(t('contact.fillAllFields'), t('contact.fillAllFieldsMessage'));
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    Alert.alert(t('contact.sent'), t('contact.sentMessage'));
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('contact.title'),
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>{t('contact.headerTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('contact.subtitle')}
          </Text>
        </Animated.View>

        {/* Contact Methods */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.methodsCard}>
            <Text style={styles.sectionTitle}>{t('contact.contactMethods')}</Text>
            <View style={styles.methodsGrid}>
              {contactMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={styles.methodItem}
                  onPress={method.action}
                  activeOpacity={0.7}
                >
                  <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                    <Ionicons name={method.icon} size={24} color={method.color} />
                  </View>
                  <Text style={styles.methodName}>{t(method.nameKey)}</Text>
                  <Text style={styles.methodValue}>{method.value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Contact Form */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>{t('contact.sendMessage')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('contact.name')}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t('contact.namePlaceholder')}
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('contact.email')}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t('contact.emailPlaceholder')}
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('contact.message')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder={t('contact.messagePlaceholder')}
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Button
              title={isSubmitting ? t('contact.sending') : t('contact.sendButton')}
              onPress={handleSubmit}
              gradient
              disabled={isSubmitting}
              style={styles.submitButton}
            />
          </Card>
        </Animated.View>

        {/* Office Hours */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Card style={styles.hoursCard}>
            <View style={styles.hoursHeader}>
              <Ionicons name="time" size={24} color={COLORS.primary} />
              <Text style={styles.hoursTitle}>{t('contact.officeHours')}</Text>
            </View>
            <View style={styles.hoursList}>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{t('contact.mondayFriday')}</Text>
                <Text style={styles.hoursTime}>9:00 - 18:00</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{t('contact.saturday')}</Text>
                <Text style={styles.hoursTime}>9:00 - 13:00</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{t('contact.sundayHolidays')}</Text>
                <Text style={styles.hoursTime}>{t('contact.closed')}</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  methodsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  methodItem: {
    width: '47%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  methodName: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.text,
    marginBottom: 2,
  },
  methodValue: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  submitButton: {
    marginTop: SPACING.sm,
  },
  hoursCard: {
    padding: SPACING.lg,
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  hoursTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  hoursList: {
    gap: SPACING.sm,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hoursDay: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  hoursTime: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
