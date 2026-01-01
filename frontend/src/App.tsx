import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages

// Components
import Layout from './components/Layout'
import Attendance from './pages/Attendance'
import Dashboard from './pages/Dashboard'
import DepartmentDetail from './pages/DepartmentDetail'
import Departments from './pages/Departments'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'

import PublicShifts from './pages/PublicShifts'
import Register from './pages/Register'
import ShiftDetail from './pages/ShiftDetail'
import Shifts from './pages/Shifts'
import Users from './pages/Users'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading">Načítání...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading">Načítání...</div>;
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicShifts />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/shifts" element={<PrivateRoute><Layout><Shifts /></Layout></PrivateRoute>} />
      <Route path="/shifts/:id" element={<PrivateRoute><Layout><ShiftDetail /></Layout></PrivateRoute>} />
      <Route path="/departments" element={<PrivateRoute><Layout><Departments /></Layout></PrivateRoute>} />
      <Route path="/departments/:id" element={<PrivateRoute><Layout><DepartmentDetail /></Layout></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute><Layout><Attendance /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><Layout><Users /></Layout></PrivateRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
