import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jwtDecode from 'jwt-decode';

const OAuthCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (token) {
      const decoded = jwtDecode(token);
      login({
        token,
        role: decoded.role,
        organizationId: decoded.organizationId,
      });
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [login, navigate]);

  return <div>Loading...</div>;
};

export default OAuthCallback;