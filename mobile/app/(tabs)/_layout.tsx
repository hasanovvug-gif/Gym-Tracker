import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { fonts, Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';

function TabDot({ focused }: { focused: boolean }) {
  const c = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <View style={[styles.tabDot, focused && styles.tabDotFocused]} />
  );
}

function TabLabel({ focused, color, label }: { focused: boolean; color: string; label: string }) {
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit={Platform.OS !== 'web'}
      minimumFontScale={0.8}
      allowFontScaling={false}
      style={{
        fontFamily: focused ? fonts.bodyBold : fonts.bodySemiBold,
        fontSize: 10,
        lineHeight: 12,
        height: 12,
        color,
        width: 72,
        flexShrink: 0,
        textAlign: 'center',
      }}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const c = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { t } = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accentInk,
        tabBarInactiveTintColor: c.textMuted,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: { flexDirection: 'column', paddingHorizontal: 0, paddingVertical: 0, minWidth: 0 },
        tabBarIconStyle: { marginBottom: 0 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
          tabBarLabel: ({ focused, color }) => <TabLabel focused={focused} color={color} label={t('tabs.home')} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: t('tabs.workouts'),
          tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
          tabBarLabel: ({ focused, color }) => <TabLabel focused={focused} color={color} label={t('tabs.workouts')} />,
        }}
      />
      <Tabs.Screen
        name="supplements"
        options={{
          title: t('tabs.supplements'),
          tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
          tabBarLabel: ({ focused, color }) => <TabLabel focused={focused} color={color} label={t('tabs.supplements')} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
          tabBarLabel: ({ focused, color }) => <TabLabel focused={focused} color={color} label={t('tabs.history')} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
          tabBarLabel: ({ focused, color }) => <TabLabel focused={focused} color={color} label={t('tabs.settings')} />,
        }}
      />
    </Tabs>
  );
}

const createStyles = (c: Palette) => StyleSheet.create({
  tabDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'transparent', marginBottom: 5 },
  tabDotFocused: { backgroundColor: c.accentInk },
  tabBar: {
    backgroundColor: c.background,
    borderTopColor: c.divider,
    borderTopWidth: 1,
    height: 78,
    paddingTop: 10,
    paddingBottom: 28,
  },
});
