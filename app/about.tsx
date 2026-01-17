/**
 * About Screen
 *
 * Displays app information, version, and credits.
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';
import { Card } from '../components/ui';
import { useTranslation } from '../hooks/useTranslation';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const BUILD_NUMBER = Constants.expoConfig?.ios?.buildNumber ?? '1';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('aboutScreen.title'),
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Version */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="nutrition" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>Nutritrack</Text>
          <Text style={styles.tagline}>{t('aboutScreen.tagline')}</Text>
          <Text style={styles.version}>
            {t('aboutScreen.version', { version: APP_VERSION, build: BUILD_NUMBER })}
          </Text>
        </View>

        {/* Features */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t('aboutScreen.features')}</Text>
          
          <FeatureItem
            icon="camera"
            title={t('aboutScreen.aiRecognition')}
            description={t('aboutScreen.aiRecognitionDesc')}
          />
          <FeatureItem
            icon="chatbubbles"
            title={t('aboutScreen.nutritionConsult')}
            description={t('aboutScreen.nutritionConsultDesc')}
          />
          <FeatureItem
            icon="fitness"
            title={t('aboutScreen.habitTracking')}
            description={t('aboutScreen.habitTrackingDesc')}
          />
          <FeatureItem
            icon="analytics"
            title={t('aboutScreen.dataAnalysis')}
            description={t('aboutScreen.dataAnalysisDesc')}
          />
        </Card>

        {/* Data & Privacy */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t('aboutScreen.dataPrivacy')}</Text>
          <Text style={styles.bodyText}>
            {t('aboutScreen.dataPrivacyText')}
          </Text>
        </Card>

        {/* Credits */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t('aboutScreen.credits')}</Text>
          <Text style={styles.bodyText}>
            {t('aboutScreen.creditsText')}
          </Text>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>
            {t('aboutScreen.copyright')}
          </Text>
          <Text style={styles.madeWith}>
            {t('aboutScreen.madeWith')}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
    </View>
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  appName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  version: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  bodyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  copyright: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
  },
  madeWith: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textMuted,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
