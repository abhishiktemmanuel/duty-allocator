import './App.css';
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/global-components/Sidebar'; 
import Duty from './components/pages/Duty';
import Teachers from './components/pages/Teachers';
import Schedule from './components/pages/Schedule';
import Register from './components/auth/Register';
import Login from './components/auth/Login';

// App.jsx
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const links = [
    { path: '/teachers', label: 'Teachers' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/duty', label: 'Duty' },
  ];

  return (
    <div className="App">
      {!token ? (
        // Login/Register routes remain the same
        <>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route
              path="/login"
              element={
                <Login
                  setToken={(newToken) => {
                    localStorage.setItem('token', newToken);
                    setToken(newToken);
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </>
      ) : (
        <div className="flex flex-col md:flex-row">
  <Sidebar
    links={links}
    brand="My App"
    setToken={setToken}
  />
  <div className="w-full md:ml-48 md:px-18 p-8">
    <Routes>
      <Route path="/duty" element={<Duty/>} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/teachers" element={<Teachers />} />
      <Route path="*" element={<Navigate to="/teachers" />} />
    </Routes>
  </div>
</div>

      )}
    </div>
  );
}


export default App;
