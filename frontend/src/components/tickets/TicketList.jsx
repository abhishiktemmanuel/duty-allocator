import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTickets } from '../../services/backendApi';
import TicketStatus from './TicketStatus';
import TicketPriority from './TicketPriority';
import TicketDetails from './TicketDetails'; // Import TicketDetails
import { format } from 'date-fns';

const TicketList = ({ onTicketUpdate }) => { 
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState(null); // Track expanded ticket

  const loadTickets = async () => {
    try {
      const response = await getTickets();
      setTickets(Array.isArray(response.message) ? response.message : []);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const toggleDetails = (ticketId) => {
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="block sm:hidden">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{ticket.title}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <TicketStatus status={ticket.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Priority:</span>
                  <TicketPriority priority={ticket.priority} />
                </div>
                <div className="flex items-center text-gray-400 justify-between">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm">{format(new Date(ticket.createdAt), 'dd/MM/yyyy')}</span>
                </div>
              </div>
              <button
                onClick={() => toggleDetails(ticket._id)}
                className="mt-3 w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
              >
                {expandedTicketId === ticket._id ? 'Hide Details' : 'View Details'}
              </button>
            </div>
            {expandedTicketId === ticket._id && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                <TicketDetails
                  ticket={ticket}
                  isAdmin={true} // Adjust based on your logic
                  onUpdate={onTicketUpdate}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 rounded-lg overflow-hidden">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6">Title</th>
            <th scope="col" className="py-3 px-6">Status</th>
            <th scope="col" className="py-3 px-6">Priority</th>
            <th scope="col" className="py-3 px-6">Created</th>
            <th scope="col" className="py-3 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(tickets) && tickets.length > 0 ? (
            tickets.map((ticket) => (
              <>
                {/* Main Row */}
                <tr
                  key={ticket._id}
                  className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 ${
                    expandedTicketId === ticket._id ? 'rounded-t-lg' : 'rounded-lg'
                  }`}
                >
                  <td className="py-4 px-6">{ticket.title}</td>
                  <td className="py-4 px-6">
                    <TicketStatus status={ticket.status} />
                  </td>
                  <td className="py-4 px-6">
                    <TicketPriority priority={ticket.priority} />
                  </td>
                  <td className="py-4 px-6">
                    {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleDetails(ticket._id)}
                      className={`text-blue-600 hover:text-blue-900 dark:hover:text-blue-400`}
                    >
                      {expandedTicketId === ticket._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedTicketId === ticket._id && (
                  <tr key={`${ticket._id}-details`} className="bg-gray-50 dark:bg-gray-900">
                    <td colSpan="5" className="p-4 rounded-b-lg">
                      {/* Render TicketDetails component */}
                      <TicketDetails
                        ticket={ticket}
                        isAdmin={true} // Adjust based on your logic
                        onUpdate={onTicketUpdate}
                      />
                    </td>
                  </tr>
                )}
              </>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No tickets found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

TicketList.propTypes = {
  onTicketUpdate: PropTypes.func.isRequired,
};

export default TicketList;

