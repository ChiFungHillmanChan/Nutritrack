/**
 * SupportInfoSection Component
 *
 * Displays the support and information settings section.
 * Includes language switcher, privacy policy, about, and FAQ links.
 */

import { Text, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING } from '../../constants/typography';
import { Card } from '../../components/ui';
import { LanguageSwitcher } from '../../components/settings';
import { useTranslation } from '../../hooks/useTranslation';
import { SettingRow } from './SettingRow';

export function SupportInfoSection() {
  const { t } = useTranslation();

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy' as never);
  };

  const handleAbout = () => {
    router.push('/about' as never);
  };

  const handleFaq = () => {
    Alert.alert(t('settings.faq'), t('settings.faqComingSoon'));
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.groupTitle}>{t('settings.supportInfo')}</Text>

      {/* Language Switcher */}
      <LanguageSwitcher />

      <SettingRow
        icon="document-text"
        iconBackgroundColor={COLORS.fiberBg}
        iconColor={COLORS.fiber}
        label={t('settings.privacyPolicy')}
        onPress={handlePrivacyPolicy}
      />

      <SettingRow
        icon="information-circle"
        iconBackgroundColor={COLORS.sodiumBg}
        iconColor={COLORS.sodium}
        label={t('settings.about')}
        onPress={handleAbout}
      />

      <SettingRow
        icon="help-circle"
        iconBackgroundColor={COLORS.infoLight}
        iconColor={COLORS.info}
        label={t('settings.faq')}
        onPress={handleFaq}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  groupTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
});
