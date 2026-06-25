import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import MyFiles from './pages/MyFiles';
import RecentFiles from './pages/RecentFiles';
import Favorites from './pages/Favorites';
import Trash from './pages/Trash';
import Settings from './pages/Settings';
import Toast from './components/Toast';

function AppLayout({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <div className="app-content">
        <Navbar />
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="/"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        <Route
          path="/my-files"
          element={
            <AppLayout>
              <MyFiles />
            </AppLayout>
          }
        />
        <Route
          path="/recent"
          element={
            <AppLayout>
              <RecentFiles />
            </AppLayout>
          }
        />
        <Route
          path="/favorites"
          element={
            <AppLayout>
              <Favorites />
            </AppLayout>
          }
        />
        <Route
          path="/trash"
          element={
            <AppLayout>
              <Trash />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  );
}

export default App;
