import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Heading, PrimaryButton } from '@/components/ui';
import { fonts, Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { useGymStore } from '@/store/useGymStore';

const PAGE_COUNT = 4;

export default function OnboardingScreen() {
  const c = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 540);
  const [pageIndex, setPageIndex] = useState(0);
  // Сдвигаем ленту сами: ref к ScrollView в этой сборке не привязывается,
  // поэтому программная прокрутка кнопкой «Далее» через него не работает.
  const offset = useRef(new Animated.Value(0)).current;
  const pageIndexRef = useRef(0);
  pageIndexRef.current = pageIndex;
  const setOnboardingSeen = useGymStore((state) => state.setOnboardingSeen);
  const { t } = useT();
  const pages = [
    { title: t('onboarding.restTitle'), body: t('onboarding.restBody') },
    { title: t('onboarding.skipTitle'), body: t('onboarding.skipBody') },
    { title: t('onboarding.supplementsTitle'), body: t('onboarding.supplementsBody') },
    { title: t('onboarding.ownTitle'), body: t('onboarding.ownBody') },
  ];

  const finish = () => setOnboardingSeen(true);
  const goTo = (index: number) => setPageIndex(Math.min(Math.max(index, 0), PAGE_COUNT - 1));
  const goNext = () => goTo(pageIndex + 1);

  useEffect(() => {
    Animated.timing(offset, {
      toValue: -pageIndex * pageWidth,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [offset, pageIndex, pageWidth]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -40) goTo(pageIndexRef.current + 1);
          else if (gesture.dx > 40) goTo(pageIndexRef.current - 1);
        },
      }),
    // goTo стабилен по смыслу: читает индекс из ref, а не из замыкания
    [],
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <View style={[styles.shell, { width: pageWidth }]}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>{t('onboarding.label')}</Text>
          {pageIndex < PAGE_COUNT - 1 ? (
            <Pressable accessibilityRole="button" onPress={finish} hitSlop={12}>
              <Text style={styles.skip}>{t('onboarding.skip')}</Text>
            </Pressable>
          ) : <View />}
        </View>

        <View testID="onboarding-pager" style={styles.pager} {...pan.panHandlers}>
          <Animated.View style={[styles.track, { width: pageWidth * PAGE_COUNT, transform: [{ translateX: offset }] }]}>
            {pages.map((page, index) => (
              <View key={page.title} style={[styles.page, { width: pageWidth }]}>
                <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
                <Heading size={36} style={styles.title}>{page.title}</Heading>
                <Text style={styles.body}>{page.body}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <View accessibilityRole="progressbar" style={styles.dots}>
            {pages.map((_, index) => (
              <View key={index} style={[styles.dot, index === pageIndex && styles.dotActive]} />
            ))}
          </View>
          <PrimaryButton
            label={pageIndex === PAGE_COUNT - 1 ? t('onboarding.done') : t('onboarding.next')}
            onPress={pageIndex === PAGE_COUNT - 1 ? finish : goNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: Palette) => StyleSheet.create({
  safe: { flex: 1, alignItems: 'center', backgroundColor: c.background },
  shell: { flex: 1, maxWidth: 540 },
  topBar: { minHeight: 60, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: c.textMuted, fontFamily: fonts.bodySemiBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.4 },
  skip: { color: c.textSecondary, fontFamily: fonts.bodyBold, fontSize: 13 },
  pager: { flex: 1, overflow: 'hidden' },
  track: { flex: 1, flexDirection: 'row' },
  page: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 28 },
  number: { color: c.accentInk, fontFamily: fonts.heading, fontSize: 82, lineHeight: 92, letterSpacing: -2 },
  title: { maxWidth: 430, lineHeight: 44 },
  body: { maxWidth: 460, marginTop: 18, color: c.textSecondary, fontFamily: fonts.body, fontSize: 16, lineHeight: 25 },
  footer: { paddingHorizontal: 24, paddingBottom: 12, gap: 22 },
  dots: { height: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.borderDashed },
  dotActive: { width: 24, backgroundColor: c.accent },
});
