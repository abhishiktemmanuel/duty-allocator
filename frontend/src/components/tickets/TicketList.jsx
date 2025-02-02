// components/tickets/TicketList.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTickets } from '../../services/backendApi';
import TicketStatus from './TicketStatus';
import TicketPriority from './TicketPriority';
import { format } from 'date-fns';

const TicketList = ({ onTicketSelect }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = async () => {
    try {
      const response = await getTickets();
      // Ensure we're getting an array from the response
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
    <div className="overflow-x-auto relative">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
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
              <tr key={ticket._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
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
                    onClick={() => onTicketSelect(ticket)}
                    className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                  >
                    View Details
                  </button>
                </td>
              </tr>
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
  );

};
TicketList.propTypes = {
  onTicketSelect: PropTypes.func.isRequired,
};

export default TicketList;
