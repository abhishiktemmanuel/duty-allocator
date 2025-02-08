import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getSubscriptionStatus } from '../../services/backendApi';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  useEffect(() => {
    if (user && (user.role === 'admin')) {
      getSubscriptionStatus()
        .then(response => {
          if(response.data.status==="active"){
            setHasActiveSubscription(true);
          }
          else{
            setHasActiveSubscription(false);
          }
          
        })
        .catch(error => {
          console.error('Error checking subscription:', error);
          setHasActiveSubscription(false);
        });
    }
  }, [user]);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'endUser' ? '/dashboard' : '/teachers'} replace />;
  }
  if ((user.role === 'admin') && 
      !hasActiveSubscription && 
      location.pathname !== '/profile') {
        console.log('Redirecting to profile');
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default ProtectedRoute;
