/**
 * Privacy Policy Screen
 *
 * Displays the app's privacy policy.
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING } from '../constants/typography';
import { Card } from '../components/ui';
import { useTranslation } from '../hooks/useTranslation';

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          title: t('privacyPolicy.title'),
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Text style={styles.lastUpdated}>{t('privacyPolicy.lastUpdated')}</Text>
          
          <Text style={styles.intro}>
            {t('privacyPolicy.intro')}
          </Text>
        </Card>

        <PolicySection
          title={t('privacyPolicy.section1Title')}
          content={t('privacyPolicy.section1Content')}
        />

        <PolicySection
          title={t('privacyPolicy.section2Title')}
          content={t('privacyPolicy.section2Content')}
        />

        <PolicySection
          title={t('privacyPolicy.section3Title')}
          content={t('privacyPolicy.section3Content')}
        />

        <PolicySection
          title={t('privacyPolicy.section4Title')}
          content={t('privacyPolicy.section4Content')}
        />

        <PolicySection
          title={t('privacyPolicy.section5Title')}
          content={t('privacyPolicy.section5Content')}
        />

        <PolicySection
          title={t('privacyPolicy.section6Title')}
          content={t('privacyPolicy.section6Content')}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PolicySection({ title, content }: { title: string; content: string }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </Card>
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
  card: {
    marginBottom: SPACING.md,
  },
  lastUpdated: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  intro: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: SPACING['3xl'],
  },
});
