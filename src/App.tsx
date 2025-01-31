import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserRoles, UserProfile } from './types/auth';
import Dashboard from './pages/Dashboard'
import DailyLog from './pages/DailyLog'
import Layout from './components/Layout.tsx'

function App() {
  console.log('App component rendering');
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <>
              {console.log('Rendering login route')}
              <LoginPage />
            </>
          } />
          <Route path="/signup" element={
            <>
              {console.log('Rendering signup route')}
              <SignupPage />
            </>
          } />
          <Route path="/unauthorized" element={
            <>
              {console.log('Rendering unauthorized route')}
              
              <UnauthorizedPage />
            </>
          } />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <>
                {console.log('Attempting to render dashboard route')}
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </>
            }
          />

          {/* Worker routes */}
          <Route
            path="/daily-log"
            element={
              <>
                {console.log('Attempting to render daily-log route')}
                <ProtectedRoute allowedRoles={[UserRoles.WORKER, UserRoles.SITE_SUPERVISOR, UserRoles.ADMIN]}>
                  <DailyLog />
                </ProtectedRoute>
              </>
            }
          />

          {/* Supervisor routes */}
          <Route
            path="/project-log"
            element={
              <>
                {console.log('Attempting to render project-log route')}
                <ProtectedRoute allowedRoles={[UserRoles.SITE_SUPERVISOR, UserRoles.ADMIN]}>
                  <div>Project Log (Replace with your ProjectLog component)</div>
                </ProtectedRoute>
              </>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <>
                {console.log('Attempting to render admin route')}
                <ProtectedRoute allowedRoles={[UserRoles.ADMIN]}>
                  <div>Admin Panel (Replace with your Admin component)</div>
                </ProtectedRoute>
              </>
            }
          />

          {/* Redirect root based on user role */}
          <Route
            path="/"
            element={
              <>
                {console.log('Attempting to render root route redirect')}
                <ProtectedRoute>
                  {({ user }: { user: UserProfile | null }) => {
                    console.log('Root route ProtectedRoute render - User:', user);
                    console.log('Root route User role:', user?.role);
                    
                    if (user?.role === UserRoles.WORKER) {
                      console.log('Root route: Redirecting WORKER to daily-log');
                      return <Navigate to="/daily-log" replace />;
                    }
                    console.log('Root route: Redirecting OTHER to dashboard');
                    return <Navigate to="/dashboard" replace />;
                  }}
                </ProtectedRoute>
              </>
            }
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={
              <>
                {console.log('Catch-all route triggered - Redirecting to root')}
                <Navigate to="/" replace />
              </>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
