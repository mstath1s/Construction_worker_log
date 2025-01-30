import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserRoles } from './types/auth';
import Dashboard from './pages/Dashboard'
import DailyLog from './pages/DailyLog'
import Layout from './components/Layout.tsx'

function App() {
  return (
    <Router>
      <AuthProvider>

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes */}


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Worker routes */}
          <Route
            path="/daily-log"
            element={
              <ProtectedRoute allowedRoles={[UserRoles.WORKER, UserRoles.SITE_SUPERVISOR, UserRoles.ADMIN]}>
                  <DailyLog />
              </ProtectedRoute>
            }
          />

          {/* Supervisor routes */}
          <Route
            path="/project-log"
            element={
              <ProtectedRoute allowedRoles={[UserRoles.SITE_SUPERVISOR, UserRoles.ADMIN]}>
                <div>Project Log (Replace with your ProjectLog component)</div>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[UserRoles.ADMIN]}>
                <div>Admin Panel (Replace with your Admin component)</div>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard if authenticated, otherwise to login */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
