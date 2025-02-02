// components/tickets/TicketPriority.jsx
import PropTypes from 'prop-types';

const TicketPriority = ({ priority }) => {
    const getPriorityColor = () => {
      switch (priority) {
        case 'HIGH':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'MEDIUM':
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        case 'LOW':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
  
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor()}`}>
        {priority}
      </span>
    );
};
  TicketPriority.propTypes = {
    priority: PropTypes.string.isRequired
  };
  
export default TicketPriority;
  
  