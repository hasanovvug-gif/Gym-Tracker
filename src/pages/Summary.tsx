import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { WORKOUT_DAYS } from '../data/workoutData';
import { formatTime } from '../lib/utils';
import { CheckCircle2, TrendingUp, Minus, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { generateWorkoutSummary } from '../lib/ai';
import { useTranslation } from 'react-i18next';

export default function Summary() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { history } = useWorkoutStore();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);

  const lastSession = history[0];

  useEffect(() => {
    if (lastSession) {
      generateWorkoutSummary(lastSession, history.slice(1), i18n.language).then((summary) => {
        setAiSummary(summary);
        setIsAiLoading(false);
      });
    }
  }, [lastSession, history, i18n.language]);

  if (!lastSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-slate-500">{t('no_workout_data')}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-medium hover:underline">{t('to_home')}</button>
      </div>
    );
  }

  const day = WORKOUT_DAYS.find(d => d.id === lastSession.dayId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center pt-8 pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <CheckCircle2 className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('great_job')}</h1>
        <p className="text-slate-500 text-sm mt-1">{day ? t(day.name) : ''} {t('completed')}</p>
      </header>

      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800">{t('coach_analysis')}</h2>
        </div>
        <div className="relative z-10 min-h-[60px] flex items-center">
          {isAiLoading ? (
            <div className="flex items-center gap-3 text-blue-600/70">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">{t('analyzing_results')}</span>
            </div>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {aiSummary}
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{t('time')}</p>
          <p className="text-2xl font-mono text-slate-900 font-medium">{formatTime(lastSession.durationSeconds)}</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{t('volume')}</p>
          <p className="text-2xl font-mono text-slate-900 font-medium">{lastSession.totalVolume} <span className="text-sm text-slate-500">{t('kg')}</span></p>
        </div>
      </div>

      <section className="bg-white border border-slate-200 shadow-sm rounded-3xl p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 px-2">{t('results')}</h2>
        <div className="space-y-3">
          {lastSession.exercises.map((log, idx) => {
            const exercise = day?.exercises.find(e => e.id === log.exerciseId);
            if (!exercise) return null;

            const weightNum = parseFloat(log.weight);
            const defaultNum = parseFloat(exercise.defaultWeight);
            const isUp = weightNum > defaultNum;
            const isSame = weightNum === defaultNum;

            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-slate-900 truncate">{t(exercise.name)}</p>
                  <p className="text-xs text-slate-500">{log.setsCompleted} / {exercise.sets} {t('sets_count')} {log.skipped && `(${t('skipped')})`}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-medium text-slate-700">{log.weight} {exercise.isTimeBased || log.weight === '0' ? '' : t('kg')}</span>
                  {log.skipped ? (
                    <Minus className="w-4 h-4 text-slate-400" />
                  ) : isUp ? (
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  ) : isSame ? (
                    <Minus className="w-4 h-4 text-slate-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <button
        onClick={() => navigate('/')}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors mt-8 shadow-sm"
      >
        {t('to_home')}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
