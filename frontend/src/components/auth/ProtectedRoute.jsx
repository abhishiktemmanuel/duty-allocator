import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, hasActiveSubscription }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'endUser' ? '/dashboard' : '/profile'} replace />;
  }

  if ((user.role === 'admin' || user.role === 'superAdmin') && !hasActiveSubscription) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  hasActiveSubscription: PropTypes.bool.isRequired
};

export default ProtectedRoute;
