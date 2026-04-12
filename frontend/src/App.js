import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import AppLayout from './components/ui/AppLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import HabitsPage from './pages/HabitsPage';
import TodayPage from './pages/TodayPage';
import AnalyticsPage from './pages/AnalyticsPage';
import GoalsPage from './pages/GoalsPage';
import SettingsPage from './pages/SettingsPage';

// Student Pages
import PomodoroPage from './pages/PomodoroPage';
import AssignmentsPage from './pages/AssignmentsPage';
import ExamsPage from './pages/ExamsPage';
import CGPAPage from './pages/CGPAPage';
import NotesPage from './pages/NotesPage';
import StudyRoomPage from './pages/StudyRoomPage';
import GamificationPage from './pages/GamificationPage';

import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

    <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="today" element={<TodayPage />} />
      <Route path="habits" element={<HabitsPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="goals" element={<GoalsPage />} />
      <Route path="settings" element={<SettingsPage />} />

      {/* Student features */}
      <Route path="pomodoro" element={<PomodoroPage />} />
      <Route path="assignments" element={<AssignmentsPage />} />
      <Route path="exams" element={<ExamsPage />} />
      <Route path="cgpa" element={<CGPAPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="study-rooms" element={<StudyRoomPage />} />
      <Route path="gamification" element={<GamificationPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;