import React, { useState } from "react";
import { registerUser } from "../../services/backendApi";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "endUser", // Default role
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      alert("Registration successful!");
    } catch (error) {
      alert(error.response?.data?.message || "Error registering user");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="endUser">End User</option>
        <option value="admin">Admin</option>
        <option value="superAdmin">Super Admin</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
