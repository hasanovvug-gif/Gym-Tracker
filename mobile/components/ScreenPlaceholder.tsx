import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function ScreenPlaceholder({ title, subtitle }: { title: string; subtitle?: string }) {
  const c = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: Palette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 30,
    textTransform: 'uppercase',
    color: c.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 6,
  },
});
