import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, requestPasswordReset } from "../../services/backendApi";
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiMail, FiAlertCircle, FiLoader, FiUser, FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await loginUser(credentials);
      const { token, role, organizationId } = response;
      login({ token, role, organizationId });
      localStorage.setItem("organizationId", organizationId);
      navigate(role === 'endUser' ? '/dashboard' : '/teachers');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await requestPasswordReset(email);
      setResetMessage(response.message);
      setShowForgotPassword(false);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-white/30 dark:border-gray-700/30">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Welcome Back
        </h2>

        {errorMessage && (
          <div className="mb-6 p-4 text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
            <FiAlertCircle className="mr-2" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div className="relative">
            <FiUser className="absolute top-3.5 left-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Username"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
            />
          </div>

          {/* Password Field with Visibility Toggle */}
          <div className="relative">
            <FiLock className="absolute top-3.5 left-4 text-gray-400 dark:text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3.5 right-4 text-gray-400 dark:text-gray-500 hover:text-blue-600"
            >
              {showPassword ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 w-full text-right"
          >
            Forgot Password?
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <FiLoader className="animate-spin mr-2" />
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <a 
            href="/auth/google"
            className="w-full py-3 px-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
            </svg>
            Google
          </a>
        </form>

        {/* Register Link */}
        <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <button
            onClick={handleRegisterRedirect}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold"
          >
            Register here
          </button>
        </p>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-white/30 dark:border-gray-700/30">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Reset Password
              </h3>
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="relative">
                  <FiMail className="absolute top-3.5 left-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Reset Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;