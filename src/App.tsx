import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthGuard from './components/AuthGuard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminRegistrationPage from './pages/AdminRegistrationPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EnvironmentPage from './pages/EnvironmentPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public routes - redirect to dashboard if already authenticated as admin */}
            <Route path="/" element={
              <AuthGuard requireAuth={false} requireAdmin={false}>
                <HomePage />
              </AuthGuard>
            } />
            
            <Route path="/login" element={
              <AuthGuard requireAuth={false} requireAdmin={false}>
                <LoginPage />
              </AuthGuard>
            } />
            
            <Route path="/admin-register" element={
              <AuthGuard requireAuth={false} requireAdmin={false}>
                <AdminRegistrationPage />
              </AuthGuard>
            } />
            
            <Route path="/forgot-password" element={
              <AuthGuard requireAuth={false} requireAdmin={false}>
                <ForgotPasswordPage />
              </AuthGuard>
            } />
            
            {/* Protected routes - require authentication and admin role */}
            <Route path="/dashboard" element={
              <AuthGuard requireAuth={true} requireAdmin={true}>
                <DashboardPage />
              </AuthGuard>
            } />
            
            <Route path="/env" element={<EnvironmentPage />} />
            
            {/* Unauthorized page */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Catch all route - redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;