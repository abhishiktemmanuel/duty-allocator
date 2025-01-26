import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/backendApi";

const Logout = ({ setToken }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser(); // Clear token from local storage or backend session
    setToken(null); // Clear token state in App.jsx or Context
    alert("Logged out successfully!");
    navigate("/login", { replace: true }); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg focus:outline-none focus:ring focus:ring-red-300"
    >
      Logout
    </button>
  );
};

Logout.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Logout;
