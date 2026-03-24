import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { WORKOUT_DAYS } from '../data/workoutData';
import { formatDistanceToNow } from 'date-fns';
import { ru, uk, enUS } from 'date-fns/locale';
import { Play, Activity, Sparkles, Loader2, Flame, Trophy, ChevronRight } from 'lucide-react';
import { generatePreWorkoutAdvice } from '../lib/ai';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { history, activeWorkout, startWorkout } = useWorkoutStore();
  const [advice, setAdvice] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(true);

  const getLocale = () => {
    switch (i18n.language) {
      case 'ru': return ru;
      case 'en': return enUS;
      case 'uk': default: return uk;
    }
  };

  const today = new Date().getDay();
  const todayWorkout = WORKOUT_DAYS.find(d => d.dayOfWeek === today) || WORKOUT_DAYS[0];
  const lastWorkout = history[0];

  const totalWorkouts = history.length;
  const totalVolume = history.reduce((sum, w) => sum + w.totalVolume, 0);

  useEffect(() => {
    if (!activeWorkout) {
      generatePreWorkoutAdvice(todayWorkout.id, history, i18n.language).then((res) => {
        setAdvice(res);
        setIsAdviceLoading(false);
      });
    }
  }, [todayWorkout.id, history, activeWorkout, i18n.language]);

  const handleStart = () => {
    if (!activeWorkout) {
      startWorkout(todayWorkout.id);
    }
    navigate('/workout');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="pt-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('hello')}, Вугар! 👋</h1>
        <p className="text-slate-500 text-sm mt-1">{t('ready_for_workout')}</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mb-3">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalWorkouts}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('workouts_count')}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalVolume > 1000 ? (totalVolume/1000).toFixed(1) + 'k' : totalVolume}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('total_volume')}</p>
        </div>
      </div>

      {!activeWorkout && (
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800">{t('coach_advice')}</h2>
          </div>
          <div className="relative z-10 min-h-[60px] flex items-center">
            {isAdviceLoading ? (
              <div className="flex items-center gap-3 text-blue-600/70">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">{t('analyzing_plan')}</span>
              </div>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {advice}
              </p>
            )}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">{t('plan_today')}</h2>
          <button onClick={() => navigate('/workouts')} className="text-sm font-bold text-blue-600 flex items-center">
            {t('see_all')} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">{t(todayWorkout.name)}</h3>
              <p className="text-sm text-slate-500">{todayWorkout.exercises.length} {t('exercises_count')}</p>
            </div>
            {activeWorkout && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-600 text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Activity className="w-3 h-3" /> {t('in_progress')}
              </span>
            )}
          </div>
          <button
            onClick={handleStart}
            className="w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
          >
            <Play className="w-5 h-5 fill-current" />
            {activeWorkout ? t('continue_workout') : t('start_workout')}
          </button>
        </div>
      </section>

      {lastWorkout && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">{t('last_activity')}</h2>
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                {formatDistanceToNow(new Date(lastWorkout.date), { addSuffix: true, locale: getLocale() })}
              </p>
              <p className="text-sm text-slate-500">{t('volume')}: {lastWorkout.totalVolume} {t('kg')} • {t('time')}: {Math.floor(lastWorkout.durationSeconds / 60)} {t('min')}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
