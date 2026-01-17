/**
 * Hamburger Menu Component
 * 
 * Slide-in drawer menu with extended functions as per design specs.
 */

import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SHADOWS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

interface MenuItem {
  id: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  onPress?: () => void;
  showIf?: () => boolean;
}

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function HamburgerMenu({ visible, onClose }: HamburgerMenuProps) {
  const { user } = useUserStore();
  const { t, language } = useTranslation();

  // Check if user has medical conditions that require medication tracking
  const hasMedicalConditions = useCallback(() => {
    if (!user?.medical_conditions) return false;
    return user.medical_conditions.some(
      (condition) => condition !== 'none'
    );
  }, [user?.medical_conditions]);

  const menuItems: MenuItem[] = [
    {
      id: 'about',
      labelKey: 'menu.aboutUs',
      icon: 'information-circle',
      route: '/about',
    },
    {
      id: 'carb-counting',
      labelKey: 'menu.carbCounting',
      icon: 'calculator',
      route: '/tools/carb-counting',
    },
    {
      id: 'medications',
      labelKey: 'menu.myMedications',
      icon: 'medkit',
      route: '/tools/medications',
      showIf: hasMedicalConditions,
    },
    {
      id: 'portion-guide',
      labelKey: 'menu.portionGuide',
      icon: 'resize',
      route: '/tools/portion-guide',
    },
    {
      id: 'lifestyle-tips',
      labelKey: 'menu.lifestyleTips',
      icon: 'bulb',
      route: '/tools/lifestyle-tips',
    },
    {
      id: 'nutrition-facts',
      labelKey: 'menu.nutritionFacts',
      icon: 'nutrition',
      route: '/tools/nutrition-facts',
    },
    {
      id: 'exercise-guide',
      labelKey: 'menu.exerciseGuide',
      icon: 'fitness',
      route: '/tools/exercise-guide',
    },
    {
      id: 'meditation',
      labelKey: 'menu.meditation',
      icon: 'leaf',
      route: '/wellness/meditation',
    },
    {
      id: 'affirmation',
      labelKey: 'menu.affirmation',
      icon: 'heart',
      route: '/wellness/affirmations',
    },
    {
      id: 'games',
      labelKey: 'menu.miniGames',
      icon: 'game-controller',
      route: '/tools/games',
    },
    {
      id: 'other-services',
      labelKey: 'menu.otherServices',
      icon: 'apps',
      route: '/services',
    },
    {
      id: 'consultation',
      labelKey: 'menu.bookConsultation',
      icon: 'calendar',
      route: '/consultation',
    },
    {
      id: 'contact',
      labelKey: 'menu.contactUs',
      icon: 'mail',
      route: '/contact',
    },
  ];

  // Helper to get English translation for secondary label
  const getEnglishLabel = (key: string): string => {
    // Extract the key suffix (e.g., 'aboutUs' from 'menu.aboutUs')
    const keyMap: Record<string, string> = {
      'menu.aboutUs': 'About us',
      'menu.carbCounting': 'Carb-counting',
      'menu.myMedications': 'My medications',
      'menu.portionGuide': 'Portion guide',
      'menu.lifestyleTips': 'Lifestyle tips',
      'menu.nutritionFacts': 'Nutrition facts',
      'menu.exerciseGuide': 'Exercise guide',
      'menu.meditation': 'Meditation',
      'menu.affirmation': 'Affirmation',
      'menu.miniGames': 'Mini games',
      'menu.otherServices': 'Other services',
      'menu.bookConsultation': 'Book a consultation',
      'menu.contactUs': 'Contact us',
    };
    return keyMap[key] ?? '';
  };

  const handleItemPress = useCallback(
    (item: MenuItem) => {
      onClose();
      if (item.route) {
        // Small delay to allow menu close animation
        setTimeout(() => {
          router.push(item.route as never);
        }, 200);
      } else if (item.onPress) {
        item.onPress();
      }
    },
    [onClose]
  );

  const filteredItems = menuItems.filter(
    (item) => !item.showIf || item.showIf()
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      {/* Menu Content */}
      <Animated.View
        entering={SlideInRight.duration(300).springify()}
        exiting={SlideOutRight.duration(200)}
        style={styles.menuContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('menu.title').toUpperCase()}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredItems.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeIn.delay(index * 50).duration(200)}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemLabel}>{t(item.labelKey)}</Text>
                  {language !== 'en' && (
                    <Text style={styles.menuItemLabelEn}>{getEnglishLabel(item.labelKey)}</Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.textTertiary}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// Button to trigger the menu
export function HamburgerMenuButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.hamburgerButton}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="menu" size={24} color={COLORS.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  backdropPressable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: COLORS.backgroundSecondary,
    ...SHADOWS.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  menuItemLabelEn: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  hamburgerButton: {
    padding: SPACING.sm,
  },
});

export default HamburgerMenu;
