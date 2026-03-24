import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Workout from './pages/Workout';
import Summary from './pages/Summary';
import History from './pages/History';
import Settings from './pages/Settings';
import AIAssistant from './components/AIAssistant';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <main className="max-w-md mx-auto h-[100dvh] relative bg-slate-50 sm:border-x sm:border-slate-200 overflow-hidden">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/workout" element={<div className="h-full overflow-y-auto p-4 pb-20"><Workout /></div>} />
            <Route path="/summary" element={<div className="h-full overflow-y-auto p-4 pb-20"><Summary /></div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AIAssistant />
        </main>
      </div>
    </Router>
  );
}
