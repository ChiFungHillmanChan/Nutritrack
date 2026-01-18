/**
 * HomeHeader Component
 *
 * Displays user greeting, stats (weight/height/BMI), and current date.
 */

import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { SPACING, TYPOGRAPHY } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';

interface HomeHeaderProps {
  userName: string | null;
  weightKg: number;
  heightCm: number;
  bmi: string | null;
  dateStr: string;
  daysSinceCreation: number;
}

export function HomeHeader({
  userName,
  weightKg,
  heightCm,
  bmi,
  dateStr,
  daysSinceCreation,
}: HomeHeaderProps) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.greeting}>
          {t('home.greeting', { name: userName ?? t('home.userDefault') })}
        </Text>
        <Text style={styles.userStats}>
          {weightKg}{t('units.kg')} • {heightCm}{t('units.cm')} • BMI {bmi}
        </Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.dateLabel}>{dateStr}</Text>
        <Text style={styles.dayCount}>
          {t('home.day')} {daysSinceCreation}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userStats: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  dayCount: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },
});
