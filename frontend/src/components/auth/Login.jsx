import React, { useState } from "react";
import PropTypes from 'prop-types';
import { loginUser } from "../../services/backendApi";

const Login = ({ setToken }) => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(credentials);
      const token = response.token;
      localStorage.setItem("token", token); // Store token in local storage
      localStorage.setItem("organizationId", response.organizationId); // Store organizationId in local storage
      setToken(token); // Update token state in App.jsx
      alert("Login successful!");
    } catch (error) {
      alert(error.response?.data?.message || "Error logging in");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={credentials.username}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={credentials.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};
Login.propTypes = {
  setToken: PropTypes.func.isRequired
};


export default Login;
