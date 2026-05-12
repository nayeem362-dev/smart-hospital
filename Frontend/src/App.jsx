import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import EmergencyPage from './pages/EmergencyPage';
import DiagnosticPage from './pages/DiagnosticPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import BillingPage from './pages/BillingPage';
import DischargePage from './pages/DischargePage';
import MedicinesPage from './pages/MedicinesPage';
import WardsPage from './pages/WardsPage';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="diagnostics" element={<DiagnosticPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="admissions" element={<AdmissionsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="discharge" element={<DischargePage />} />
        <Route path="medicines" element={<MedicinesPage />} />
        <Route path="wards" element={<WardsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </AuthProvider>
    </BrowserRouter>
  );
}