/**
 * Tab Layout with Hamburger Menu
 * 
 * Main tab navigation layout with header actions.
 */

import { useState, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { SPACING } from '../../constants/typography';
import { HamburgerMenu } from '../../components/navigation';
import { useTranslation } from '../../hooks/useTranslation';

const ICON_SIZE = 20;
const CONTAINER_SIZE = 40;

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.iconContainer}>
      {focused ? (
        <LinearGradient
          colors={GRADIENTS.primary}
          style={styles.iconBg}
        >
          <Ionicons name={name} size={ICON_SIZE} color={COLORS.textInverse} />
        </LinearGradient>
      ) : (
        <View style={styles.iconBgInactive}>
          <Ionicons name={name} size={ICON_SIZE} color={color} />
        </View>
      )}
    </View>
  );
}

// Settings button for header left
function SettingsHeaderButton() {
  return (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => router.push('/(tabs)/settings')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityLabel="Settings"
      accessibilityRole="button"
      accessibilityHint="Opens settings page"
    >
      <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

// Menu button for header right
function MenuHeaderButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityLabel="Menu"
      accessibilityRole="button"
      accessibilityHint="Opens navigation menu"
    >
      <Ionicons name="menu" size={24} color={COLORS.text} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const { t } = useTranslation();

  const openMenu = useCallback(() => setMenuVisible(true), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textTertiary,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
          tabBarShowLabel: false,
          tabBarLabelStyle: styles.tabBarLabelHidden,
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
          headerRight: () => <MenuHeaderButton onPress={openMenu} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('nav.home'),
            tabBarLabel: () => null,
            tabBarAccessibilityLabel: t('nav.home'),
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="home" color={color} focused={focused} />
            ),
            headerTitle: t('tabs.home'),
            headerTitleStyle: styles.headerTitleMain,
            headerLeft: () => <SettingsHeaderButton />,
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: t('nav.camera'),
            tabBarLabel: () => null,
            tabBarAccessibilityLabel: t('nav.camera'),
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="camera" color={color} focused={focused} />
            ),
            headerTitle: t('tabs.record'),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: t('nav.habits'),
            tabBarLabel: () => null,
            tabBarAccessibilityLabel: t('nav.habits'),
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="checkmark-circle" color={color} focused={focused} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: t('nav.calendar'),
            tabBarLabel: () => null,
            tabBarAccessibilityLabel: t('nav.calendar'),
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="calendar" color={color} focused={focused} />
            ),
            headerTitle: t('tabs.calendar'),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: t('nav.chat'),
            tabBarLabel: () => null,
            tabBarAccessibilityLabel: t('nav.chat'),
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="chatbubbles" color={color} focused={focused} />
            ),
            headerTitle: t('tabs.chat'),
            // Hide chat from tab bar
            href: null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('nav.profile'),
            tabBarLabel: () => null,
            tabBarAccessibilityLabel: t('nav.profile'),
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="person" color={color} focused={focused} />
            ),
            headerTitle: t('tabs.profile'),
          }}
        />
      </Tabs>

      {/* Hamburger Menu Modal */}
      <HamburgerMenu visible={menuVisible} onClose={closeMenu} />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 70 : 56,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 20 : 4,
    paddingHorizontal: 8,
    ...SHADOWS.lg,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabBarLabelHidden: {
    display: 'none',
    height: 0,
    width: 0,
  },
  iconContainer: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBg: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    borderRadius: CONTAINER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.colored(COLORS.primary),
  },
  iconBgInactive: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    borderRadius: CONTAINER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: COLORS.backgroundSecondary,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerTitleMain: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  headerButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
});
