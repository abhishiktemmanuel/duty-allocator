import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import Logout from "../auth/Logout";
import { useState, useEffect } from "react";

const Sidebar = ({ links, brand, className = "", setToken }) => {
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const NavContent = () => (
    <>
      <div>
        <div className="p-4 text-lg font-bold bg-gray-900">
          {brand || "My App"}
        </div>
        <nav className="flex text-left flex-col p-4 space-y-4" >
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => isMobile && setIsOpen(false)}
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
      <div className="p-4">
        <Logout setToken={setToken} />
      </div>
    </>
  );

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded bg-gray-800 text-white"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span className={`h-0.5 w-full bg-white transform transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`h-0.5 w-full bg-white transition-all ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`h-0.5 w-full bg-white transform transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      )}
      
      <div className={`
        ${isMobile ? 'fixed inset-0 z-40' : 'w-64 h-screen fixed top-0 left-0'} 
        ${isMobile && !isOpen ? 'translate-x-[-100%]' : 'translate-x-0'}
        bg-gray-800 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out ${className}
      `}>
        <NavContent />
      </div>
      
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
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
  setToken: PropTypes.func.isRequired,
};

export default Sidebar;
