import { Link, Stack } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';

export default function NotFoundScreen() {
  const c = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { t } = useT();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>{t('notFound.title')}</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.link}>{t('notFound.home')}</Text>
        </Link>
      </View>
    </>
  );
}

const createStyles = (c: Palette) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: c.background,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: c.textPrimary,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    color: c.accentInk,
    fontFamily: fonts.bodyMedium,
  },
});
