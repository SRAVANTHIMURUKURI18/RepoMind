import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LandingPage }   from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResultsPage }   from './pages/ResultsPage';
import { HistoryPage }   from './pages/HistoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/"               element={<LandingPage />}   />
        <Route path="/dashboard"      element={<DashboardPage />} />
        <Route path="/results/:id"    element={<ResultsPage />}   />
        <Route path="/history"        element={<HistoryPage />}   />
        <Route path="/reports"        element={<Navigate to="/history" replace />} />
        <Route path="/settings"       element={<Navigate to="/dashboard" replace />} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
