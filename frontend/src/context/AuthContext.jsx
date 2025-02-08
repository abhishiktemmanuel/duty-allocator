import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return {
          token,
          role: decoded.role,
          organizationId: decoded.organizationId,
          hasActiveSubscription: decoded.hasActiveSubscription || false
        };
      } catch (error) {
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('organizationId');
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      // If the token is being updated, save it to localStorage
      if (updates.token) {
        localStorage.setItem('token', updates.token);
      }
      return updatedUser;
    });
  };

  // Verify token on mount and setup interval to check periodically
  useEffect(() => {
    const verifyToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
    };

    verifyToken();
    const interval = setInterval(verifyToken, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const value = {
    user,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// import { createContext, useContext, useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
// import { jwtDecode } from 'jwt-decode';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         return {
//           token,
//           role: decoded.role,
//           organizationId: decoded.organizationId
//         };
//       } catch (error) {
//         localStorage.removeItem('token');
//         return null;
//       }
//     }
//     return null;
//   });

//   const login = (userData) => {
//     localStorage.setItem('token', userData.token);
//     setUser(userData);
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('organizationId');
//     setUser(null);
//   };

//   // Verify token on mount and setup interval to check periodically
//   useEffect(() => {
//     const verifyToken = () => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         try {
//           const decoded = jwtDecode(token);
//           if (decoded.exp * 1000 < Date.now()) {
//             logout();
//           }
//         } catch (error) {
//           logout();
//         }
//       }
//     };

//     verifyToken();
//     const interval = setInterval(verifyToken, 60000); // Check every minute
//     return () => clearInterval(interval);
//   }, []);

//   const value = {
//     user,
//     login,
//     logout
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// AuthProvider.propTypes = {
//   children: PropTypes.node.isRequired
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
