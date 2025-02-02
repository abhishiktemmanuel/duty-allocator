import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './components/global-components/Sidebar'; 
import Duty from './components/pages/Duty';
import Teachers from './components/pages/Teachers';
import Schedule from './components/pages/Schedule';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import TeacherDashboard from './components/pages/TeacherDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import TicketSystem from './components/tickets/TicketSystem';


function AppContent() {
  const { user, logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && user) {
      logout();
    }
  }, [user, logout]);

  const getNavLinks = (role) => {
    switch (role) {
      case 'superAdmin':
      case 'admin':
        return [
          { path: '/teachers', label: 'Teachers' },
          { path: '/schedule', label: 'Schedule' },
          { path: '/duty', label: 'Duty' },
          { path: '/tickets', label: 'Tickets' },
        ];
      case 'endUser':
        return [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/tickets', label: 'Help' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="App">
      {!user ? (
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div className="flex flex-col md:flex-row">
          <Sidebar
            links={getNavLinks(user.role)}
            brand="My App"
            setToken={logout}
          />
          <div className="w-full md:ml-48 md:px-18 p-8">
            <Routes>
              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'superAdmin']} />}>
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/duty" element={<Duty />} />
              </Route>

              {/* End User Routes */}
              <Route element={<ProtectedRoute allowedRoles={['endUser']} />}>
                <Route path="/dashboard" element={<TeacherDashboard />} />
              </Route>

              {/* Shared Routes - Protected but accessible by both admin and endUser */}
  <Route element={<ProtectedRoute allowedRoles={['admin', 'superAdmin', 'endUser']} />}>
    <Route 
      path="/tickets" 
      element={<TicketSystem isAdmin={user.role === 'admin' || user.role === 'superAdmin'} />} 
    />
  </Route>

              {/* Default Route */}
              <Route path="/" element={
                <Navigate to={user.role === 'endUser' ? '/dashboard' : '/teachers'} />
              } />
              <Route path="*" element={
                <Navigate to={user.role === 'endUser' ? '/dashboard' : '/teachers'} />
              } />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
