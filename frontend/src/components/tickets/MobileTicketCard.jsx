// components/tickets/MobileTicketCard.jsx
import TicketStatus from './TicketStatus';
import TicketPriority from './TicketPriority';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const MobileTicketCard = ({ ticket, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(ticket)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {ticket.title}
        </h3>
        <TicketPriority priority={ticket.priority} />
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <TicketStatus status={ticket.status} />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
        {ticket.description}
      </p>
    </div>
  );
};

MobileTicketCard.propTypes = {
  ticket: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};

// Update TicketList.jsx to include mobile view
const TicketList = ({ onTicketSelect }) => {
  // ... existing state and loading logic ...

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto relative">
        {/* ... existing table code ... */}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {tickets.map((ticket) => (
          <MobileTicketCard
            key={ticket._id}
            ticket={ticket}
            onSelect={onTicketSelect}
          />
        ))}
      </div>
    </>
  );
};
