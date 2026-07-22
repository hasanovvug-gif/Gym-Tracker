import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Heading, PrimaryButton, Screen } from '@/components/ui';
import { fonts, Palette } from '@/constants/theme';
import { useNow } from '@/hooks/useNow';
import { useTheme } from '@/hooks/useTheme';
import { resolveDayName, resolveName } from '@/i18n/displayName';
import { useGymStore } from '@/store/useGymStore';
import { calculateSupplementStreak } from '@/utils/supplements';
import { formatDuration, formatNumber, formatShortDate, formatToday } from '@/utils/format';
import { useT } from '@/i18n';

function useThemedStyles() {
  const c = useTheme();
  return useMemo(() => createStyles(c), [c]);
}

export default function HomeScreen() {
  const styles = useThemedStyles();
  const router = useRouter();
  const now = useNow();
  const { t, language } = useT();
  const { workoutDays, history, activeSession, supplementLogs, supplements, startWorkout } = useGymStore();
  const lastSession = history[0];
  const lastDayIndex = workoutDays.findIndex((day) => day.id === lastSession?.dayId);
  const plannedDay = workoutDays[(Math.max(0, lastDayIndex) + 1) % Math.max(1, workoutDays.length)] ?? workoutDays[0];
  const volume = history.reduce((sum, session) => sum + session.totalVolume, 0);
  const streak = calculateSupplementStreak(supplements, supplementLogs);
  const activeSeconds = activeSession
    ? activeSession.activeSeconds + (activeSession.phase === 'paused' ? 0 : Math.floor((now - activeSession.activeStartedAt) / 1000))
    : 0;

  const start = () => {
    if (!plannedDay) return;
    startWorkout(plannedDay.id);
    router.push('/workout-session');
  };

  return (
    <Screen>
      <View>
        <Text style={styles.date}>{formatToday(language)}</Text>
        <Heading>{t('home.title')}</Heading>
      </View>

      {activeSession ? (
        <Pressable onPress={() => router.push('/workout-session')} style={styles.activeCard}>
          <View style={styles.activeTop}>
            <Text style={styles.activeEyebrow}>{activeSession.phase === 'paused' ? t('home.paused') : t('home.active')}</Text>
            <View style={styles.activeDot} />
          </View>
          <Text style={styles.activeTimer}>{formatDuration(activeSeconds)}</Text>
          <Text style={styles.activeMeta}>{t('home.activeMeta', { day: workoutDays.findIndex((day) => day.id === activeSession.dayId) + 1, name: resolveDayName(activeSession, t), current: activeSession.currentExerciseIndex + 1, total: activeSession.exercises.length })}</Text>
          <View style={styles.continueButton}><Text style={styles.continueText}>{t('common.continue')}</Text></View>
        </Pressable>
      ) : plannedDay ? (
        <Card style={styles.planCard}>
          <Text style={styles.eyebrow}>{t('home.todayPlan')}</Text>
          <Heading size={27} style={styles.planHeading}>{t('home.planTitle', { day: workoutDays.indexOf(plannedDay) + 1, name: resolveName(plannedDay, t) })}</Heading>
          <Text style={styles.planMeta}>{t('home.planMeta', { count: plannedDay.exercises.length, minutes: Math.max(30, plannedDay.exercises.length * 9) })}</Text>
          <PrimaryButton label={t('common.start')} onPress={start} style={styles.startButton} />
        </Card>
      ) : (
        <Card><Text style={styles.planMeta}>{t('home.emptyPlan')}</Text></Card>
      )}

      <View style={styles.stats}>
        <Stat value={String(history.length)} label={t('home.workouts')} />
        <Stat value={`${formatNumber(volume / 1000, language)} ${t('common.tons')}`} label={t('home.totalVolume')} />
        <Stat value={t('home.streakValue', { count: streak })} label={t('home.supplementStreak')} accent />
      </View>

      {lastSession && (
        <Pressable onPress={() => router.push('/(tabs)/history')}>
          <Card>
            <Text style={styles.lastEyebrow}>{t('home.lastWorkout')}</Text>
            <View style={styles.lastHeader}>
              <Text style={styles.lastTitle}>{t('common.day')} — {resolveDayName(lastSession, t)}</Text>
              <Text style={styles.lastDate}>{formatShortDate(lastSession.date, language)}</Text>
            </View>
            <View style={styles.lastStats}>
              <Text style={styles.lastMeta}>{Math.ceil((lastSession.activeSeconds + lastSession.pausedSeconds) / 60)} {t('common.minutes')}</Text>
              <Text style={styles.lastMeta}>{formatNumber(lastSession.totalVolume, language)} {t('common.kg')}</Text>
              <Text style={styles.lastMeta}>{t('common.sets', { count: lastSession.exercises.reduce((sum, exercise) => sum + exercise.completedSets, 0) })}</Text>
            </View>
          </Card>
        </Pressable>
      )}
    </Screen>
  );
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  const styles = useThemedStyles();
  return (
    <Card style={styles.statCard}>
      <Text numberOfLines={1} style={[styles.statValue, accent && styles.statAccent]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const createStyles = (c: Palette) => StyleSheet.create({
  date: { color: c.textSecondary, fontFamily: fonts.bodySemiBold, fontSize: 13, marginBottom: 1 },
  planCard: { borderRadius: 24, padding: 20 },
  eyebrow: { color: c.accentInk, fontFamily: fonts.bodyBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  planHeading: { lineHeight: 34, marginTop: 4 },
  planMeta: { color: c.textSecondary, fontFamily: fonts.body, fontSize: 14, marginTop: 3 },
  startButton: { marginTop: 16 },
  activeCard: { backgroundColor: c.accent, borderRadius: 24, padding: 20 },
  activeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeEyebrow: { color: c.accentText, fontFamily: fonts.bodyBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.accentText },
  activeTimer: { color: c.accentText, fontFamily: fonts.heading, fontSize: 40, marginTop: 4 },
  activeMeta: { color: c.onAccentMuted, fontFamily: fonts.bodySemiBold, fontSize: 12, lineHeight: 18 },
  continueButton: { minHeight: 50, marginTop: 14, borderRadius: 16, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' },
  continueText: { color: c.accentInk, fontFamily: fonts.bodyExtraBold, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 },
  stats: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, paddingHorizontal: 11, paddingVertical: 13, borderRadius: 18 },
  statValue: { color: c.textPrimary, fontFamily: fonts.heading, fontSize: 22 },
  statAccent: { color: c.accentInk },
  statLabel: { color: c.textSecondary, fontFamily: fonts.bodySemiBold, fontSize: 9, marginTop: 2 },
  lastEyebrow: { color: c.textSecondary, fontFamily: fonts.bodyBold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  lastHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'baseline', marginTop: 8 },
  lastTitle: { color: c.textPrimary, fontFamily: fonts.bodyBold, fontSize: 14, flex: 1 },
  lastDate: { color: c.textSecondary, fontFamily: fonts.body, fontSize: 11 },
  lastStats: { flexDirection: 'row', gap: 15, marginTop: 7 },
  lastMeta: { color: c.textSecondary, fontFamily: fonts.body, fontSize: 12 },
});
