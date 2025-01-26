import './App.css';
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/global-components/Sidebar'; // Import Sidebar
import Teachers from './components/pages/Teachers';
import Schedule from './components/pages/Schedule';
import Register from './components/auth/Register';
import Login from './components/auth/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token')); // Manage authentication state

  // Define navigation links for authenticated users
  const links = [
    { path: '/teachers', label: 'Teachers' },
    { path: '/schedule', label: 'Schedule' },
  ];

  return (
    <div className="App">
      {!token ? (
        // If user is not logged in, show Register and Login components
        <>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route
              path="/login"
              element={
                <Login
                  setToken={(newToken) => {
                    localStorage.setItem('token', newToken); // Save token to localStorage
                    setToken(newToken); // Update token state
                  }}
                />
              }
            />
            {/* Redirect to login if no route matches */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </>
      ) : (
        // If user is logged in, show authenticated components with Sidebar and Logout
        <div className="flex">
          {/* Sidebar Component */}
          <Sidebar
            links={links}
            brand="My App"
            onLogout={() => {
              localStorage.removeItem('token'); // Remove token from localStorage
              setToken(null); // Clear token state
            }}
          />

          {/* Main Content */}
          <div className="ml-64 flex-1 p-8">
            <Routes>
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/schedule" element={<Schedule />} />
              {/* Redirect to Teachers page if no route matches */}
              <Route path="*" element={<Navigate to="/teachers" />} />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
