/**
 * Hamburger Menu Component
 * 
 * Slide-in drawer menu with extended functions as per design specs.
 */

import { useState, useCallback } from 'react';
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

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

interface MenuItem {
  id: string;
  label: string;
  labelEn: string;
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
      label: '關於我們',
      labelEn: 'About us',
      icon: 'information-circle',
      route: '/about',
    },
    {
      id: 'carb-counting',
      label: '碳水計算',
      labelEn: 'Carb-counting',
      icon: 'calculator',
      route: '/tools/carb-counting',
    },
    {
      id: 'medications',
      label: '我的藥物',
      labelEn: 'My medications',
      icon: 'medkit',
      route: '/tools/medications',
      showIf: hasMedicalConditions,
    },
    {
      id: 'portion-guide',
      label: '份量指南',
      labelEn: 'Portion guide',
      icon: 'resize',
      route: '/tools/portion-guide',
    },
    {
      id: 'lifestyle-tips',
      label: '生活貼士',
      labelEn: 'Lifestyle tips',
      icon: 'bulb',
      route: '/tools/lifestyle-tips',
    },
    {
      id: 'nutrition-facts',
      label: '營養知識',
      labelEn: 'Nutrition facts',
      icon: 'nutrition',
      route: '/tools/nutrition-facts',
    },
    {
      id: 'exercise-guide',
      label: '運動指南',
      labelEn: 'Exercise guide',
      icon: 'fitness',
      route: '/tools/exercise-guide',
    },
    {
      id: 'meditation',
      label: '冥想',
      labelEn: 'Meditation',
      icon: 'leaf',
      route: '/wellness/meditation',
    },
    {
      id: 'affirmation',
      label: '正面語句',
      labelEn: 'Affirmation',
      icon: 'heart',
      route: '/wellness/affirmations',
    },
    {
      id: 'games',
      label: '迷你遊戲',
      labelEn: 'Mini games',
      icon: 'game-controller',
      route: '/tools/games',
    },
    {
      id: 'other-services',
      label: '其他服務',
      labelEn: 'Other services',
      icon: 'apps',
      route: '/services',
    },
    {
      id: 'consultation',
      label: '預約諮詢',
      labelEn: 'Book a consultation',
      icon: 'calendar',
      route: '/consultation',
    },
    {
      id: 'contact',
      label: '聯絡我們',
      labelEn: 'Contact us',
      icon: 'mail',
      route: '/contact',
    },
  ];

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
          <Text style={styles.headerTitle}>EXTENDED FUNCTIONS</Text>
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
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Text style={styles.menuItemLabelEn}>{item.labelEn}</Text>
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
