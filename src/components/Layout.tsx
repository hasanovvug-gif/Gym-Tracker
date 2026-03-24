import { Outlet, NavLink } from 'react-router-dom';
import { Home, Dumbbell, History, Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Layout() {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 sm:border-x sm:border-slate-200 px-6 py-2 flex justify-between items-center z-40 pb-safe max-w-md mx-auto">
        <NavItem to="/" icon={<Home />} label={t('nav_home')} />
        <NavItem to="/workouts" icon={<Dumbbell />} label={t('nav_workouts')} />
        <NavItem to="/history" icon={<History />} label={t('nav_history')} />
        <NavItem to="/settings" icon={<Settings />} label={t('nav_settings')} />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 transition-colors py-1 ${
          isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}>
            {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
          </div>
          <span className="text-[10px] font-bold tracking-wide">{label}</span>
        </>
      )}
    </NavLink>
  );
}
