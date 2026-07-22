import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Heading, PrimaryButton, Screen, Tappable } from '@/components/ui';
import { fonts, Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { resolveDayName, resolveName } from '@/i18n/displayName';
import { useGymStore } from '@/store/useGymStore';

export default function WorkoutsScreen() {
  const c = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const router = useRouter();
  const { t } = useT();
  const days = useGymStore((state) => state.workoutDays);
  const startWorkout = useGymStore((state) => state.startWorkout);
  const activeSession = useGymStore((state) => state.activeSession);
  const [expandedId, setExpandedId] = useState(days[1]?.id ?? days[0]?.id);

  const begin = (dayId: string) => {
    startWorkout(dayId);
    router.push('/workout-session');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Heading>{t('workouts.title')}</Heading>
        <Tappable onPress={() => router.push('/plan-editor')} style={styles.editButton}>
          <Text style={styles.editText}>{t('workouts.editPlan')}</Text>
        </Tappable>
      </View>

      {activeSession && (
        <Card accent>
          <Text style={styles.eyebrow}>{t('workouts.alreadyStarted')}</Text>
          <Text style={styles.activeTitle}>{t('home.planTitle', { day: days.findIndex((day) => day.id === activeSession.dayId) + 1, name: resolveDayName(activeSession, t) })}</Text>
          <PrimaryButton label={activeSession.phase === 'paused' ? t('common.continue') : t('workouts.returnToWorkout')} onPress={() => router.push('/workout-session')} style={styles.resumeButton} />
        </Card>
      )}

      {days.length === 0 ? (
        <Card><Text style={styles.empty}>{t('workouts.empty')}</Text></Card>
      ) : days.map((day, index) => {
        const expanded = expandedId === day.id;
        return (
          <Tappable haptic="select" scaleTo={0.99} key={day.id} onPress={() => setExpandedId(expanded ? '' : day.id)}>
            <Card accent={expanded}>
              <View style={styles.dayHeader}>
                <View style={styles.flex}>
                  <Text style={styles.dayTitle}>{t('home.planTitle', { day: index + 1, name: resolveName(day, t) })}</Text>
                  <Text style={[styles.dayMeta, expanded && styles.dayMetaActive]}>{expanded ? t('workouts.selectedDay') : t('common.exercises', { count: day.exercises.length })}</Text>
                </View>
                <Text style={[styles.chevron, expanded && styles.chevronActive]}>{expanded ? '⌄' : '›'}</Text>
              </View>
              {expanded && (
                <View style={styles.exerciseList}>
                  {day.exercises.map((exercise) => (
                    <View key={exercise.id} style={styles.exerciseRow}>
                      <Text style={styles.exerciseName}>{resolveName(exercise, t)}</Text>
                      <Text style={styles.exerciseMeta}>
                        {exercise.plannedSets} × {exercise.isTimeBased ? `${exercise.secondsPerSet ?? 60} ${t('common.seconds')}` : `${exercise.reps}${exercise.weight > 0 ? ` · ${exercise.weight} ${t('common.kg')}` : ''}`}
                      </Text>
                    </View>
                  ))}
                  <PrimaryButton
                    label={t('workouts.startDay', { day: index + 1 })}
                    onPress={() => begin(day.id)}
                    disabled={Boolean(activeSession) || day.exercises.length === 0}
                    style={styles.startButton}
                  />
                </View>
              )}
            </Card>
          </Tappable>
        );
      })}
    </Screen>
  );
}

const createStyles = (c: Palette) => StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editButton: { minHeight: 44, borderWidth: 1, borderColor: c.accentInk, borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center' },
  editText: { color: c.accentInk, fontFamily: fonts.bodyBold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  eyebrow: { color: c.accentInk, fontFamily: fonts.bodyBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  activeTitle: { color: c.textPrimary, fontFamily: fonts.headingSemiBold, fontSize: 23, textTransform: 'uppercase', marginTop: 5 },
  resumeButton: { marginTop: 14 },
  dayHeader: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  dayTitle: { color: c.textPrimary, fontFamily: fonts.bodyBold, fontSize: 16 },
  dayMeta: { color: c.textSecondary, fontFamily: fonts.body, fontSize: 13, marginTop: 3 },
  dayMetaActive: { color: c.accentInk, fontFamily: fonts.bodySemiBold },
  chevron: { color: c.textMuted, fontFamily: fonts.body, fontSize: 22, marginLeft: 12 },
  chevronActive: { color: c.accentInk },
  exerciseList: { borderTopWidth: 1, borderTopColor: c.border, marginTop: 14, paddingTop: 10, gap: 9 },
  exerciseRow: { flexDirection: 'row', gap: 12, justifyContent: 'space-between', alignItems: 'baseline' },
  exerciseName: { color: c.textPrimary, fontFamily: fonts.body, fontSize: 14, flex: 1 },
  exerciseMeta: { color: c.textSecondary, fontFamily: fonts.body, fontSize: 13 },
  startButton: { marginTop: 6, minHeight: 48 },
  empty: { color: c.textSecondary, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
});
