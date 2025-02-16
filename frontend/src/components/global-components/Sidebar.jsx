import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getTickets } from '../../services/backendApi';
import { useAuth } from '../../context/AuthContext';
import { 
  FiLogOut, 
  FiUsers, 
  FiCalendar, 
  FiClipboard, 
  FiMessageSquare,
  FiUser,
  FiHome,
  FiMenu,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ links, className = "", setToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Keep existing ticket count useEffect

  const iconMap = {
    '/teachers': <FiUsers className="w-5 h-5 mr-3" />,
    '/schedule': <FiCalendar className="w-5 h-5 mr-3" />,
    '/duty': <FiClipboard className="w-5 h-5 mr-3" />,
    '/tickets': <FiMessageSquare className="w-5 h-5 mr-3" />,
    '/profile': <FiUser className="w-5 h-5 mr-3" />,
    '/dashboard': <FiHome className="w-5 h-5 mr-3" />,
    '/help': <FiMessageSquare className="w-5 h-5 mr-3" />
  };

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-medium text-gray-100">nuncio</h1>
        </div>
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FiX className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={() => setIsOpen(false)} // Always close on nav item click
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors
              ${isActive 
                ? 'text-white bg-gray-700/50' 
                : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'}`
            }
          >
            {iconMap[link.path]}
            <span className="text-sm">{link.label}</span>
            {link.path === '/tickets' && ticketCount > 0 && (
              <span className="ml-auto px-2.5 py-1 text-xs font-medium bg-gray-700 rounded-full">
                {ticketCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setToken(null)}
          className="w-full flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700/30 rounded-lg"
        >
          <FiLogOut className="w-5 h-5 mr-3" />
          <span className="text-sm">Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button - only visible when sidebar is closed */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
        >
          <FiMenu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-0 z-40 w-64' : 'w-64 h-screen fixed top-0 left-0'} 
        bg-gray-900 border-r border-gray-800/70
        flex flex-col justify-between transition-transform duration-300 ease-in-out ${className}
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <NavContent />
      </div>

      {/* Overlay - only visible on mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
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