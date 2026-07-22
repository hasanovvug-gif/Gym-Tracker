import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { Card, Heading, Screen, Tappable } from '@/components/ui';
import { fonts, Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { translateReason, useT } from '@/i18n';
import { resolveDayName, resolveExerciseName } from '@/i18n/displayName';
import { useGymStore } from '@/store/useGymStore';
import { WorkoutSession } from '@/types/workout';
import { formatDuration, formatNumber, formatShortDate, pluralize } from '@/utils/format';

export default function HistoryScreen() {
  const c = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { t, language } = useT();
  const history = useGymStore((state) => state.history);
  const [expandedId, setExpandedId] = useState(history[0]?.id ?? '');

  return (
    <Screen>
      <Heading>{t('history.title')}</Heading>
      <VolumeChart history={history} />
      {history.length === 0 && <Card><Text style={styles.empty}>{t('history.empty')}</Text></Card>}
      {history.map((session) => {
        const expanded = expandedId === session.id;
        return (
          <Tappable haptic="select" scaleTo={0.99} key={session.id} onPress={() => setExpandedId(expanded ? '' : session.id)}>
            <Card accent={expanded}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{t('common.day')} — {resolveDayName(session, t)}</Text>
                <Text style={styles.sessionDate}>{formatShortDate(session.date, language)}</Text>
              </View>
              <View style={styles.metrics}>
                <Text style={styles.metric}>{Math.ceil((session.activeSeconds + session.pausedSeconds) / 60)} {t('common.minutes')} · {Math.ceil(session.activeSeconds / 60)} {t('common.activeShort')}</Text>
                <Text style={styles.metric}>{formatNumber(session.totalVolume, language)} {t('common.kg')}</Text>
                {session.pauseCount > 0 && <Text style={styles.pauseMetric}>{t('history.pauseCount', { count: session.pauseCount, form: pluralize(session.pauseCount, [t('history.pauseOne'), t('history.pauseFew'), t('history.pauses').toLowerCase()], language) })}</Text>}
              </View>
              {expanded && (
                <View style={styles.details}>
                  {session.pauseRecords.length > 0 && (
                    <View style={styles.pauseDetails}>
                      <Text style={styles.pauseDetailsTitle}>{t('history.pauses')}</Text>
                      <Text style={styles.pauseDetailsText}>
                        {session.pauseRecords.map((record) => `${formatDuration(record.durationSeconds)}${record.reasonTag ? ` · ${translateReason(language, record.reasonTag)}` : ''}`).join('   ')}
                      </Text>
                    </View>
                  )}
                  {session.exercises.length === 0 ? (
                    <Text style={styles.empty}>{t('history.detailsMissing')}</Text>
                  ) : session.exercises.map((exercise) => (
                    <View key={exercise.exerciseId} style={styles.exerciseRow}>
                      <View style={styles.flex}>
                        <Text style={[styles.exerciseName, exercise.status === 'skipped' && styles.skipped]}>{resolveExerciseName(exercise, t)}</Text>
                        {exercise.status === 'ended_early' && <Text style={styles.early}>{t('history.endedEarly')}{exercise.reasonTag ? ` · ${translateReason(language, exercise.reasonTag)}` : ''}</Text>}
                        {exercise.status === 'skipped' && <Text style={styles.skippedMeta}>{t('history.skipped')}{exercise.reasonTag ? ` · ${translateReason(language, exercise.reasonTag)}` : ''}</Text>}
                      </View>
                      <Text style={[styles.exerciseMeta, exercise.status === 'skipped' && styles.skipped]}>{exercise.completedSets}/{exercise.plannedSets} · {exercise.isTimeBased ? `${exercise.secondsPerSet ?? 60} ${t('common.seconds')}` : exercise.weight > 0 ? `${exercise.weight} ${t('common.kg')}` : t('common.bodyweight')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </Tappable>
        );
      })}
    </Screen>
  );
}

function VolumeChart({ history }: { history: WorkoutSession[] }) {
  const c = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { t, language } = useT();
  const chart = useMemo(() => {
    const currentWeek = new Date();
    currentWeek.setHours(0, 0, 0, 0);
    currentWeek.setDate(currentWeek.getDate() - ((currentWeek.getDay() + 6) % 7));
    const weeks = Array.from({ length: 8 }, (_, index) => {
      const start = new Date(currentWeek);
      start.setDate(start.getDate() - (7 - index) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const volume = history.reduce((sum, session) => {
        const date = new Date(session.date);
        return date >= start && date < end ? sum + session.totalVolume : sum;
      }, 0);
      return { start, volume };
    });
    const volumes = weeks.map((week) => week.volume);
    const max = Math.max(...volumes, 1);
    const coordinates = volumes.map((volume, index) => ({
      x: index * 42,
      y: 96 - (volume / max) * 68,
    }));
    const baseline = volumes.slice(0, -1).find((volume) => volume > 0) ?? 0;
    const last = volumes[volumes.length - 1];
    const label = (date: Date) => new Intl.DateTimeFormat({ RU: 'ru-RU', UA: 'uk-UA', EN: 'en-GB' }[language], { day: 'numeric', month: 'short' }).format(date).replace('.', '');
    return {
      points: coordinates.map((point) => `${point.x},${point.y}`).join(' '),
      lastX: coordinates[coordinates.length - 1].x,
      lastY: coordinates[coordinates.length - 1].y,
      change: baseline === 0 ? 0 : Math.round(((last - baseline) / baseline) * 100),
      labels: [label(weeks[0].start), label(weeks[4].start), label(weeks[7].start)],
    };
  }, [history, language]);

  return (
    <Card style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>{t('history.chartTitle')}</Text>
        <Text style={[styles.chartChange, chart.change < 0 && { color: c.warning }]}>{chart.change >= 0 ? '↗ +' : '↘ '}{chart.change}%</Text>
      </View>
      <Svg width="100%" height={110} viewBox="0 0 300 110">
        <Line x1="0" y1="30" x2="300" y2="30" stroke={c.divider} strokeWidth="1" />
        <Line x1="0" y1="65" x2="300" y2="65" stroke={c.divider} strokeWidth="1" />
        <Line x1="0" y1="100" x2="300" y2="100" stroke={c.divider} strokeWidth="1" />
        <Polyline points={chart.points} fill="none" stroke={c.accentInk} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={chart.lastX} cy={chart.lastY} r="5" fill={c.accent} />
      </Svg>
      <View style={styles.chartLabels}>{chart.labels.map((label) => <Text key={label} style={styles.chartLabel}>{label}</Text>)}</View>
    </Card>
  );
}

const createStyles = (c: Palette) => StyleSheet.create({
  chartCard: { borderRadius: 20, padding: 17 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  chartTitle: { color: c.textSecondary, fontFamily: fonts.bodyBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  chartChange: { color: c.accentInk, fontFamily: fonts.bodyExtraBold, fontSize: 13 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  chartLabel: { color: c.textDim, fontFamily: fonts.bodySemiBold, fontSize: 9 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  sessionTitle: { flex: 1, color: c.textPrimary, fontFamily: fonts.bodyBold, fontSize: 14 },
  sessionDate: { color: c.textSecondary, fontFamily: fonts.body, fontSize: 11 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  metric: { color: c.textSecondary, fontFamily: fonts.body, fontSize: 12 },
  pauseMetric: { color: c.warning, fontFamily: fonts.body, fontSize: 12 },
  details: { borderTopWidth: 1, borderTopColor: c.border, marginTop: 11, paddingTop: 8, gap: 4 },
  pauseDetails: { paddingBottom: 8, marginBottom: 2, borderBottomWidth: 1, borderBottomColor: c.divider },
  pauseDetailsTitle: { color: c.warning, fontFamily: fonts.bodyBold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  pauseDetailsText: { color: c.textSecondary, fontFamily: fonts.body, fontSize: 11, marginTop: 3 },
  exerciseRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  exerciseName: { color: c.textPrimary, fontFamily: fonts.body, fontSize: 12 },
  exerciseMeta: { color: c.textSecondary, fontFamily: fonts.body, fontSize: 11 },
  early: { color: c.warning, fontFamily: fonts.body, fontSize: 10 },
  skipped: { color: c.textMuted },
  skippedMeta: { color: c.textMuted, fontFamily: fonts.body, fontSize: 10 },
  empty: { color: c.textMuted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
});
