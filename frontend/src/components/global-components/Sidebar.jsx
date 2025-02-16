import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getTickets } from '../../services/backendApi';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiCircle, FiSquare } from 'react-icons/fi';

const Sidebar = ({ links, className = "", setToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const { user } = useAuth();

  // Keep existing useEffect hooks unchanged

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-light text-gray-300">⸱⸱⸱</div>
          <h1 className="text-lg font-medium text-gray-100">nuncio</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-all 
              ${isActive 
                ? 'text-white bg-gray-700/50' 
                : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'}`
            }
          >
            <FiCircle className="w-4 h-4 mr-3" />
            <span className="text-sm">{link.label}</span>
            {link.path === '/tickets' && ticketCount > 0 && (
              <span className="ml-auto px-2 text-xs font-medium bg-gray-700 rounded-full">
                {ticketCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setToken(null)}
          className="w-full flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700/30 rounded-lg group"
        >
          <FiSquare className="w-4 h-4 mr-3 transform group-hover:rotate-12 transition-transform" />
          <span className="text-sm">Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
        >
          <div className="space-y-1.5">
            <span className="block w-6 h-0.5 bg-current" />
            <span className="block w-6 h-0.5 bg-current" />
            <span className="block w-4 h-0.5 bg-current" />
          </div>
        </button>
      )}

      <div className={`
        ${isMobile ? 'fixed inset-0 z-40 w-64' : 'w-64 h-screen fixed top-0 left-0'} 
        bg-gray-900 border-r border-gray-800/70
        flex flex-col justify-between transition-transform duration-300 ease-in-out ${className}
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <NavContent />
      </div>

      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

// PropTypes remain the same...

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