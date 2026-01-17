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
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { Card, Button } from '../components/ui';

interface ContactMethod {
  id: string;
  name: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action: () => void;
}

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactMethods: ContactMethod[] = [
    {
      id: 'email',
      name: '電郵',
      value: 'support@nutritrack.app',
      icon: 'mail',
      color: COLORS.primary,
      action: () => Linking.openURL('mailto:support@nutritrack.app'),
    },
    {
      id: 'phone',
      name: '電話',
      value: '+852 1234 5678',
      icon: 'call',
      color: COLORS.info,
      action: () => Linking.openURL('tel:+85212345678'),
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      value: '+852 1234 5678',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => Linking.openURL('https://wa.me/85212345678'),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      value: '@nutritrack.hk',
      icon: 'logo-instagram',
      color: '#E4405F',
      action: () => Linking.openURL('https://instagram.com/nutritrack.hk'),
    },
  ];

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('請填寫所有欄位', '姓名、電郵和訊息為必填項目');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    Alert.alert('已發送', '我們已收到你的訊息，將盡快回覆。');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '聯絡我們',
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>聯絡我們</Text>
          <Text style={styles.subtitle}>
            有任何問題或建議？我們樂意聆聽
          </Text>
        </Animated.View>

        {/* Contact Methods */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.methodsCard}>
            <Text style={styles.sectionTitle}>聯絡方式</Text>
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
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodValue}>{method.value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Contact Form */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>發送訊息</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>姓名</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="你的姓名"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>電郵</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>訊息</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="你想告訴我們什麼？"
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Button
              title={isSubmitting ? '發送中...' : '發送訊息'}
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
              <Text style={styles.hoursTitle}>辦公時間</Text>
            </View>
            <View style={styles.hoursList}>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>星期一至五</Text>
                <Text style={styles.hoursTime}>9:00 - 18:00</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>星期六</Text>
                <Text style={styles.hoursTime}>9:00 - 13:00</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>星期日及公眾假期</Text>
                <Text style={styles.hoursTime}>休息</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
