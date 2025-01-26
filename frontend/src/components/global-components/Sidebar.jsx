import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import Logout from "../auth/Logout"; // Import the Logout button component

const Sidebar = ({ links, brand, className = "", setToken }) => {
  return (
    <div
      className={`w-64 h-screen bg-gray-800 text-white fixed top-0 left-0 flex flex-col justify-between ${className}`}
    >
      {/* Top Section: Branding and Navigation Links */}
      <div>
        {/* Branding Section */}
        <div className="p-4 text-lg font-bold bg-gray-900">
          {brand || "My App"}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col p-4 space-y-4">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block py-2 px-4 rounded ${
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Logout Button */}
      <div className="p-4">
        <Logout setToken={setToken} />
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  brand: PropTypes.string,
  className: PropTypes.string,
  setToken: PropTypes.func.isRequired, // Required for Logout component
};

export default Sidebar;
