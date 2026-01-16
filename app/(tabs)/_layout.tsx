import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';

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

export default function TabLayout() {
  return (
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首頁',
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
          headerTitle: 'Nutritrack',
          headerTitleStyle: styles.headerTitleMain,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: '記錄',
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="camera" color={color} focused={focused} />
          ),
          headerTitle: '記錄食物',
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: '習慣',
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="checkmark-circle" color={color} focused={focused} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '問問',
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="chatbubbles" color={color} focused={focused} />
          ),
          headerTitle: 'AI 營養師',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="settings" color={color} focused={focused} />
          ),
          headerTitle: '設定',
        }}
      />
    </Tabs>
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
});
