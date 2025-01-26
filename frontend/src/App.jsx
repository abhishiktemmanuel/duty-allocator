import './App.css';
import { useState } from 'react';
import Teachers from './components/pages/Teachers';
import Schedule from './components/pages/Schedule';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Logout from './components/auth/Logout';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token')); // Manage authentication state

  return (
    <div className="App">
      {!token ? (
        // If user is not logged in, show Register and Login components
        <>
          <h1>Welcome! Please Register or Login</h1>
          <Register />
          <Login setToken={(newToken) => {
            localStorage.setItem('token', newToken); // Save token to localStorage
            setToken(newToken); // Update token state
          }} />
        </>
      ) : (
        // If user is logged in, show authenticated components and Logout button
        <>
          <h1>Welcome Back!</h1>
          <Logout setToken={() => {
            localStorage.removeItem('token'); // Remove token from localStorage
            setToken(null); // Clear token state
          }} />
          {/* Authenticated pages */}
          <Teachers />
          <Schedule />
        </>
      )}
    </div>
  );
}

export default App;
