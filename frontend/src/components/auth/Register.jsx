import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/backendApi";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await registerUser(formData);
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error registering admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Admin Registration
        </h2>

        {errorMessage && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm text-left pl-1 font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg w-full px-4 py-2 text-sm text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-left pl-1 font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg w-full px-4 py-2 text-sm text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-left pl-1 font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg w-full px-4 py-2 text-sm text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-[0.6rem] px-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring focus:ring-blue-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Registering..." : "Register as Admin"}
          </button>
        </form>

        {/* Back to Login Button */}
        <div className="mt-[1.5rem]">
          <button
            onClick={() => navigate("/login")}
            className="w-full py-[0.6rem] px-[1.5rem] bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:outline-none focus:ring focus:ring-green-300"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
