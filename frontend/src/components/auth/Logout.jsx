import React from "react";
import PropTypes from 'prop-types';
import { logoutUser } from "../../services/backendApi";

const Logout = ({ setToken }) => {
  const handleLogout = () => {
    logoutUser(); // Clear token from local storage
    setToken(null); // Clear token state in App.jsx
    alert("Logged out successfully!");
  };

  return <button onClick={handleLogout}>Logout</button>;
};

Logout.propTypes = {
  setToken: PropTypes.func.isRequired
};

export default Logout;
