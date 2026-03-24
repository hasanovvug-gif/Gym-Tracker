import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { WORKOUT_DAYS } from '../data/workoutData';
import { Activity, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Workouts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeWorkout, startWorkout } = useWorkoutStore();
  
  const today = new Date().getDay();

  const handleStart = (dayId: string) => {
    if (activeWorkout?.dayId === dayId) {
      navigate('/workout');
    } else {
      startWorkout(dayId);
      navigate('/workout');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="pt-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('programs')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('choose_workout')}</p>
      </header>

      <div className="grid gap-4">
        {WORKOUT_DAYS.map((day) => {
          const isToday = day.dayOfWeek === today;
          const isActive = activeWorkout?.dayId === day.id;
          
          return (
            <div 
              key={day.id}
              onClick={() => handleStart(day.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer hover:border-blue-300 shadow-sm ${
                isToday || isActive
                  ? 'bg-blue-50/50 border-blue-200' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isToday || isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                    {t(day.name)}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {day.exercises.length} {t('exercises_count')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isToday && !isActive && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                      {t('today')}
                    </span>
                  )}
                  {isActive && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-600 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Activity className="w-3 h-3" /> {t('in_progress')}
                    </span>
                  )}
                </div>
              </div>

              <button
                className={`w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  isToday || isActive
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Play className={`w-4 h-4 ${isToday || isActive ? 'fill-current' : ''}`} />
                {isActive ? t('continue') : t('start')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
