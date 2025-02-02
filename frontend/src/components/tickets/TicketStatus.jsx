// components/tickets/TicketStatus.jsx
import PropTypes from 'prop-types';

const TicketStatus = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'OPEN':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'IN_PROGRESS':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'RESOLVED':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'CLOSED':
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
  
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {status.replace('_', ' ')}
      </span>
    );
};
  TicketStatus.propTypes = {
    status: PropTypes.string.isRequired
  };
  
export default TicketStatus;
  
  