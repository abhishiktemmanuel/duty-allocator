import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/backendApi";
import { 
  FiArrowLeft, 
  FiLock, 
  FiMail, 
  FiUser, 
  FiBook, 
  FiEye, 
  FiEyeOff, 
  FiAlertCircle, 
  FiLoader, 
  FiGlobe,
  FiPhone 
} from "react-icons/fi";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';


const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    orgName: "",
    affiliation: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setErrorMessage("Invalid phone number");
      return;
    }
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-white/30 dark:border-gray-700/30">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
        >
          <FiArrowLeft className="mr-2" /> Back to Login
        </button>
  
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Create Admin Account
        </h2>
  
        {errorMessage && (
          <div className="mb-6 p-4 text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
            <FiAlertCircle className="mr-2" />
            {errorMessage}
          </div>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Institute Name */}
          <div className="relative">
            <FiBook className="absolute top-3.5 left-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              id="orgName"
              name="orgName"
              placeholder="Institute Name"
              value={formData.orgName}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
            />
          </div>
  
          {/* University/Board */}
          <div className="relative">
            <FiGlobe className="absolute top-3.5 left-4 text-gray-400 dark:text-gray-500" />
            <select
              id="affiliation"
              name="affiliation"
              value={formData.affiliation}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 appearance-none"
            >
                <option value="" disabled >Select University/Board</option>
                <option value="Uttar Pradesh Board">Uttar Pradesh Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="Bihar Board">Bihar Board</option>
                <option value="Jharkhand Board">Jharkhand Board</option>
                <option value="West Bengal Board">West Bengal Board</option>
                <option value="Madhya Pradesh Board">Madhya Pradesh Board</option>
                <option value="Maharashtra Board">Maharashtra Board</option>
                <option value="Karnataka Board">Karnataka Board</option>
                <option value="Tamil Nadu Board">Tamil Nadu Board</option>
                <option value="Kerala Board">Kerala Board</option>
                <option value="Gujarat Board">Gujarat Board</option>
                <option value="Rajasthan Board">Rajasthan Board</option>
                <option value="Punjab Board">Punjab Board</option>
                <option value="Haryana Board">Haryana Board</option>
                <option value="Uttarakhand Board">Uttarakhand Board</option>
                <option value="Himachal Pradesh Board">Himachal Pradesh Board</option>
                <option value="Jammu & Kashmir Board">Jammu & Kashmir Board</option>
                <option value="Assam Board">Assam Board</option>
                <option value="Manipur Board">Manipur Board</option>
                <option value="Meghalaya Board">Meghalaya Board</option>
                <option value="Mizoram Board">Mizoram Board</option>
                <option value="Nagaland Board">Nagaland Board</option>
                <option value="Tripura Board">Tripura Board</option>
                <option value="Sikkim Board">Sikkim Board</option>
                <option value="Arunachal Pradesh Board">Arunachal Pradesh Board</option>
                <option value="Goa Board">Goa Board</option>
                <option value="Telangana Board">Telangana Board</option>
                <option value="Andhra Pradesh Board">Andhra Pradesh Board</option>
                <option value="Christ University">Christ University</option>
                <option value="Amity University">Amity University</option>
                <option value="Manipal University">Manipal University</option>
                <option value="SRM University">SRM University</option>
                <option value="VIT University">VIT University</option>
                <option value="BITS Pilani">BITS Pilani</option>
                <option value="NIT Trichy">NIT Trichy</option>
                <option value="NIT Warangal">NIT Warangal</option>
                <option value="NIT Surathkal">NIT Surathkal</option>
                <option value="NIT Calicut">NIT Calicut</option>
                <option value="NIT Rourkela">NIT Rourkela</option>
                <option value="NIT Durgapur">NIT Durgapur</option>
                <option value="NIT Kurukshetra">NIT Kurukshetra</option>
                <option value="NIT Jamshedpur">NIT Jamshedpur</option>
                <option value="NIT Nagpur">NIT Nagpur</option>
                <option value="NIT Patna">NIT Patna</option>
                <option value="NIT Raipur">NIT Raipur</option>
                <option value="NIT Jalandhar">NIT Jalandhar</option>
                <option value="NIT Bhopal">NIT Bhopal</option>
                <option value="Other">Other</option>
            </select>
          </div>
  
          {/* Full Name */}
          <div className="relative">
            <FiUser className="absolute top-3.5 left-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Full Name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
            />
          </div>
  
          {/* Email */}
          <div className="relative">
            <FiMail className="absolute top-3.5 left-4 text-gray-400 dark:text-gray-500" />
            <input
              type="email"
              placeholder="Email Address"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <FiPhone className="absolute top-3.5 left-4 text-gray-400 dark:text-gray-500 z-10" />
            <PhoneInput
              country={'in'}
              value={formData.phoneNumber}
              onChange={(phone) => setFormData({ ...formData, phoneNumber: phone })}
              inputProps={{
                name: 'phoneNumber',
                required: true,
                className: 'w-full pl-20 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30'
              }}
              containerClass="relative"
              buttonClass="absolute top-1/2 transform  left-10 z-10 bg-transparent border-none"
              dropdownClass="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>

  
          {/* Password */}
          <div className="relative">
            <FiLock className="absolute top-3.5 left-4 text-gray-400 dark:text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              id="password"
              name="password"
              value={formData.password}
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
  
          {/* Confirm Password */}
          <div className="relative">
            <FiLock className="absolute top-3.5 left-4 text-gray-400 dark:text-gray-500" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-3.5 right-4 text-gray-400 dark:text-gray-500 hover:text-blue-600"
            >
              {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>
  
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <FiLoader className="animate-spin mr-2" />
                Creating Account...
              </div>
            ) : (
              "Register Now"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

