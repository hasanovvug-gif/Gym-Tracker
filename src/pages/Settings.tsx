import React from 'react';
import { User, Bell, Moon, Shield, CircleHelp, LogOut, ChevronRight, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <header className="pt-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('settings')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('profile_and_app_management')}</p>
      </header>

      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">{t('account')}</h2>
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <SettingItem icon={<User className="w-5 h-5 text-blue-500" />} label={t('profile')} />
            <div className="h-px bg-slate-100 ml-12" />
            <SettingItem icon={<Bell className="w-5 h-5 text-orange-500" />} label={t('notifications')} />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">{t('app')}</h2>
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-sky-500" />
                <span className="font-medium text-slate-700">{t('language')}</span>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={i18n.language} 
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="text-sm text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="uk">Українська</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <div className="h-px bg-slate-100 ml-12" />
            <SettingItem icon={<Moon className="w-5 h-5 text-indigo-500" />} label={t('dark_theme')} value={t('off')} />
            <div className="h-px bg-slate-100 ml-12" />
            <SettingItem icon={<Shield className="w-5 h-5 text-emerald-500" />} label={t('privacy')} />
            <div className="h-px bg-slate-100 ml-12" />
            <SettingItem icon={<CircleHelp className="w-5 h-5 text-purple-500" />} label={t('help_and_support')} />
          </div>
        </section>

        <button className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
}

function SettingItem({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-slate-400">{value}</span>}
        <ChevronRight className="w-5 h-5 text-slate-300" />
      </div>
    </button>
  );
}
