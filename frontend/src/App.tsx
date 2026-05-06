import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/shared/Sidebar';
import PublicPage from './pages/PublicPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import DevicesPage from './pages/DevicesPage';
import DeviceDetailPage from './pages/DeviceDetailPage';
import ProfilePage from './pages/ProfilePage';
import MemberProfilePage from './pages/MemberProfilePage';
import ManageDevicesPage from './pages/ManageDevicesPage';
import { StatsPage, AlertsPage, NewsPage, MembersPage } from './pages/OtherPages';
import { AdminUsersPage, AdminDeletionsPage, AdminPlatformPage } from './pages/AdminPages';
import type { Level } from './types';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  minLevel?: Level;
}

function ProtectedRoute({ children, minLevel }: ProtectedRouteProps) {
  const { user, loading, canAccess } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (minLevel && !canAccess(minLevel)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-actions">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🏠 Maison Connectée</span>
          </div>
        </header>
        <main className="page-wrapper">{children}</main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <PublicPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Module Information */}
      <Route path="/news" element={<ProtectedRoute><AppLayout title="📰 Actualités"><NewsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><AppLayout title="👥 Membres"><MembersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/members/:id" element={<ProtectedRoute><AppLayout title="👤 Profil membre"><MemberProfilePage /></AppLayout></ProtectedRoute>} />

      {/* Module Visualisation */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout title="🏠 Tableau de bord"><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/devices" element={<ProtectedRoute><AppLayout title="🔌 Appareils connectés"><DevicesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/devices/:id" element={<ProtectedRoute><AppLayout title="🔌 Détail appareil"><DeviceDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout title="👤 Mon profil"><ProfilePage /></AppLayout></ProtectedRoute>} />

      {/* Module Gestion */}
      <Route path="/manage-devices" element={<ProtectedRoute minLevel="avancé"><AppLayout title="⚙️ Gestion appareils"><ManageDevicesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute minLevel="avancé"><AppLayout title="📊 Statistiques"><StatsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute minLevel="avancé"><AppLayout title="🔔 Alertes"><AlertsPage /></AppLayout></ProtectedRoute>} />

      {/* Module Administration */}
      <Route path="/admin/users" element={<ProtectedRoute minLevel="expert"><AppLayout title="🛡️ Utilisateurs"><AdminUsersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/deletions" element={<ProtectedRoute minLevel="expert"><AppLayout title="🗑️ Demandes suppression"><AdminDeletionsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/platform" element={<ProtectedRoute minLevel="expert"><AppLayout title="📈 Plateforme"><AdminPlatformPage /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}