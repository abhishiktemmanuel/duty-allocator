import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  // Check for token and user authentication
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (!allowedRoles.includes(user.role)) {
    // Redirect based on user role instead of to /unauthorized
    return <Navigate to={user.role === 'endUser' ? '/dashboard' : '/teachers'} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default ProtectedRoute;



// import { Navigate, Outlet } from 'react-router-dom';
// import PropTypes from 'prop-types';
// import { useAuth } from '../../context/AuthContext';

// const ProtectedRoute = ({ allowedRoles }) => {
//   const { user } = useAuth();
//   const token = localStorage.getItem('token');
  
//   if (!token || !user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (!allowedRoles.includes(user.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <Outlet />;
// };

// ProtectedRoute.propTypes = {
//   allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
// };

// export default ProtectedRoute;
