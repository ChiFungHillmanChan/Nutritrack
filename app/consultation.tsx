/**
 * Book a Consultation Screen
 * 
 * Allows users to book appointments with dietitians.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { Card, Button } from '../components/ui';

interface ConsultationType {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const CONSULTATION_TYPES: ConsultationType[] = [
  {
    id: 'initial',
    name: '初次諮詢',
    description: '全面營養評估及個人化飲食計劃',
    duration: '60 分鐘',
    price: 'HK$800',
    icon: 'clipboard',
    color: COLORS.primary,
  },
  {
    id: 'followup',
    name: '跟進諮詢',
    description: '檢視進度及調整飲食計劃',
    duration: '30 分鐘',
    price: 'HK$500',
    icon: 'refresh',
    color: COLORS.info,
  },
  {
    id: 'diabetes',
    name: '糖尿病營養諮詢',
    description: '專為糖尿病患者設計的飲食管理',
    duration: '45 分鐘',
    price: 'HK$700',
    icon: 'medkit',
    color: COLORS.error,
  },
  {
    id: 'sports',
    name: '運動營養諮詢',
    description: '為運動愛好者優化營養攝取',
    duration: '45 分鐘',
    price: 'HK$650',
    icon: 'fitness',
    color: COLORS.calories,
  },
];

export default function ConsultationScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleBooking = () => {
    if (!selectedType) {
      Alert.alert('請選擇', '請先選擇諮詢類型');
      return;
    }

    Alert.alert(
      '預約諮詢',
      '我們會透過電郵聯絡你確認預約詳情。\n\n你亦可以直接致電預約。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '致電預約',
          onPress: () => Linking.openURL('tel:+85212345678'),
        },
        {
          text: '發送電郵',
          onPress: () => Linking.openURL('mailto:booking@nutritrack.app?subject=預約諮詢'),
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '預約諮詢',
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>預約營養師諮詢</Text>
          <Text style={styles.subtitle}>
            與專業註冊營養師一對一諮詢，獲取個人化建議
          </Text>
        </Animated.View>

        {/* Consultation Types */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionTitle}>選擇諮詢類型</Text>
          
          {CONSULTATION_TYPES.map((type, index) => (
            <Animated.View
              key={type.id}
              entering={FadeInDown.delay(250 + index * 50)}
            >
              <Card
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.typeCardSelected,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <View style={styles.typeHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: type.color + '20' }]}>
                    <Ionicons name={type.icon} size={24} color={type.color} />
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeName}>{type.name}</Text>
                    <Text style={styles.typeDesc}>{type.description}</Text>
                  </View>
                  {selectedType === type.id && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                    </View>
                  )}
                </View>
                <View style={styles.typeMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>{type.duration}</Text>
                  </View>
                  <Text style={styles.typePrice}>{type.price}</Text>
                </View>
              </Card>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Book Button */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Button
            title="預約諮詢"
            onPress={handleBooking}
            gradient
            style={styles.bookButton}
            disabled={!selectedType}
          />
        </Animated.View>

        {/* Info */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>關於我們的營養師</Text>
            <View style={styles.infoItem}>
              <Ionicons name="school" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>註冊營養師</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="briefcase" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>超過 10 年臨床經驗</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="language" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>粵語、普通話、英語</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>面對面或視像諮詢</Text>
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
  typeCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  typeCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.colored(COLORS.primary),
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  typeName: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  typeDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  checkmark: {
    marginLeft: SPACING.sm,
  },
  typeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  typePrice: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
  },
  bookButton: {
    marginVertical: SPACING.lg,
  },
  infoCard: {
    padding: SPACING.lg,
  },
  infoTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
