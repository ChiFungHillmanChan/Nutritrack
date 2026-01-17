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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { Card, Button } from '../components/ui';
import { useTranslation } from '../hooks/useTranslation';

interface ConsultationType {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const CONSULTATION_TYPES: ConsultationType[] = [
  { id: 'initial', icon: 'clipboard', color: COLORS.primary },
  { id: 'followup', icon: 'refresh', color: COLORS.info },
  { id: 'diabetes', icon: 'medkit', color: COLORS.error },
  { id: 'sports', icon: 'fitness', color: COLORS.calories },
];

export default function ConsultationScreen() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleBooking = () => {
    if (!selectedType) {
      Alert.alert(t('consultation.pleaseSelect'), t('consultation.selectTypeFirst'));
      return;
    }

    Alert.alert(
      t('consultation.bookingTitle'),
      t('consultation.bookingMessage'),
      [
        { text: t('consultation.cancel'), style: 'cancel' },
        {
          text: t('consultation.callToBook'),
          onPress: () => Linking.openURL('tel:+85212345678'),
        },
        {
          text: t('consultation.sendEmail'),
          onPress: () => Linking.openURL('mailto:booking@nutritrack.app?subject=預約諮詢'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('consultation.title'),
          headerStyle: { backgroundColor: COLORS.backgroundSecondary },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>{t('consultation.headerTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('consultation.subtitle')}
          </Text>
        </Animated.View>

        {/* Consultation Types */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionTitle}>{t('consultation.selectType')}</Text>
          
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
                    <Text style={styles.typeName}>{t(`consultation.types.${type.id}.name`)}</Text>
                    <Text style={styles.typeDesc}>{t(`consultation.types.${type.id}.description`)}</Text>
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
                    <Text style={styles.metaText}>{t(`consultation.types.${type.id}.duration`)}</Text>
                  </View>
                  <Text style={styles.typePrice}>{t(`consultation.types.${type.id}.price`)}</Text>
                </View>
              </Card>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Book Button */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Button
            title={t('consultation.bookButton')}
            onPress={handleBooking}
            gradient
            style={styles.bookButton}
            disabled={!selectedType}
          />
        </Animated.View>

        {/* Info */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t('consultation.aboutDietitians')}</Text>
            <View style={styles.infoItem}>
              <Ionicons name="school" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{t('consultation.registeredDietitian')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="briefcase" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{t('consultation.yearsExperience')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="language" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{t('consultation.languages')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{t('consultation.consultMode')}</Text>
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
