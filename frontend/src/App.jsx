import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import LandingPage from './components/pages/LandingPage';
import Profile from './components/pages/Profile';
import { getSubscriptionStatus } from './services/backendApi';
import PrivacyPolicy from './components/pages/legal-pages/PrivacyPolicy';
import TermsAndConditions from './components/pages/legal-pages/TermsAndConditions';
import CancellationRefundPolicy from './components/pages/legal-pages/CancellationRefundPolicy';


function AppContent() {
  const { user, logout } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && user) {
      logout();
    }
    if (user && (user.role === 'admin' || user.role === 'superAdmin')) {
      checkSubscriptionStatus();
    }
  }, [user, logout]);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await getSubscriptionStatus();
      setHasActiveSubscription(response.data.status === "active");
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    }
  };

  const getNavLinks = (role) => {
    if ((role === 'admin' || role === 'superAdmin') && !hasActiveSubscription) {
      return [{ path: '/profile', label: 'Profile' }];
    }
    switch (role) {
      case 'superAdmin':
      case 'admin':
        return [
          { path: '/teachers', label: 'Teachers' },
          { path: '/schedule', label: 'Schedule' },
          { path: '/duty', label: 'Duty' },
          { path: '/tickets', label: 'Tickets' },
          { path: '/profile', label: 'Profile' },
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
           {/* Policy Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/cancellation-refund-policy" element={<CancellationRefundPolicy />} />
        </Routes>
      ) : (
        <div className="flex flex-col md:flex-row">
          <Sidebar
            links={getNavLinks(user.role)}
            brand="My App"
            setToken={logout}
          />
          <div className="w-full md:ml-48 md:px-26 p-8">
            <Routes>
              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'superAdmin']} hasActiveSubscription={hasActiveSubscription} />}>
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/duty" element={<Duty />} />
                <Route path="/tickets" element={<TicketSystem isAdmin={true} />} />
              </Route>

              {/* Profile Route (always accessible) */}
              <Route path="/profile" element={<Profile />} />

              {/* End User Routes */}
              <Route element={<ProtectedRoute allowedRoles={['endUser']} hasActiveSubscription={true} />}>
                <Route path="/dashboard" element={<TeacherDashboard />} />
                <Route path="/tickets" element={<TicketSystem isAdmin={false} />} />
              </Route>

              {/* Default Route for Authenticated Users */}
              <Route
                path="/"
                element={<Navigate to={user.role === 'endUser' ? '/dashboard' : (hasActiveSubscription ? '/teachers' : '/profile')} />}
              />
              <Route
                path="*"
                element={<Navigate to={user.role === 'endUser' ? '/dashboard' : (hasActiveSubscription ? '/teachers' : '/profile')} />}
              />
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
