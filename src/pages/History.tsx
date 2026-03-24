import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { WORKOUT_DAYS } from '../data/workoutData';
import { formatTime } from '../lib/utils';
import { format } from 'date-fns';
import { ru, uk, enUS } from 'date-fns/locale';
import { Calendar, Clock, Activity, ChevronDown, ChevronUp, History as HistoryIcon, Sparkles, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateWeeklyReport } from '../lib/ai';
import { useTranslation } from 'react-i18next';

export default function History() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { history } = useWorkoutStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [weeklyReport, setWeeklyReport] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const getLocale = () => {
    switch (i18n.language) {
      case 'ru': return ru;
      case 'en': return enUS;
      case 'uk': default: return uk;
    }
  };

  const chartData = [...history].reverse().map((session) => ({
    date: format(new Date(session.date), 'dd MMM', { locale: getLocale() }),
    volume: session.totalVolume,
  }));

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    const report = await generateWeeklyReport(history, i18n.language);
    setWeeklyReport(report);
    setIsReportLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 pb-24">
      <header className="pt-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('history')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('progress_and_reports')}</p>
      </header>

      {history.length > 0 ? (
        <>
          <section className="bg-white border border-slate-200 shadow-sm rounded-3xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">{t('volume_progress')}</h2>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `${val}к`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                    itemStyle={{ color: '#2563eb', fontWeight: 500 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm rounded-3xl p-5 relative overflow-hidden mb-8">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800">{t('weekly_report')}</h2>
            </div>
            
            <div className="relative z-10">
              {!weeklyReport && !isReportLoading ? (
                <button 
                  onClick={handleGenerateReport}
                  className="w-full py-2.5 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 font-medium rounded-xl transition-colors shadow-sm text-sm"
                >
                  {t('generate_report')}
                </button>
              ) : isReportLoading ? (
                <div className="flex items-center justify-center gap-3 text-blue-600/70 py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">{t('analyzing_workouts')}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {weeklyReport}
                </p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 px-2">{t('workouts')}</h2>
            {history.map((session) => {
              const day = WORKOUT_DAYS.find((d) => d.id === session.dayId);
              const isExpanded = expandedId === session.id;

              return (
                <div 
                  key={session.id}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden transition-all"
                >
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : session.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{day ? t(day.name) : t('workout')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {format(new Date(session.date), 'd MMM yyyy, HH:mm', { locale: getLocale() })}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50">
                      <div className="flex gap-4 mb-4 mt-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatTime(session.durationSeconds)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                          {session.totalVolume} {t('kg')}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {session.exercises.map((log, idx) => {
                          const exercise = day?.exercises.find((e) => e.id === log.exerciseId);
                          if (!exercise) return null;

                          return (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                              <div className="flex-1 pr-4">
                                <p className="text-sm text-slate-800 font-medium">{t(exercise.name)}</p>
                                <p className="text-xs text-slate-500">{log.setsCompleted} / {exercise.sets} {t('sets_count')} {log.skipped && `(${t('skipped')})`}</p>
                              </div>
                              <div className="font-mono text-sm font-medium text-blue-600 shrink-0">
                                {log.weight} {exercise.isTimeBased || log.weight === '0' ? '' : t('kg')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mb-4">
            <HistoryIcon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">{t('history_empty')}</p>
          <p className="text-sm text-slate-500 mt-1">{t('do_first_workout')}</p>
        </div>
      )}
    </div>
  );
}
