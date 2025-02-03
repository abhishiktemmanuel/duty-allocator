// components/tickets/TicketSystem.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import CreateTicket from './CreateTicket';
import TicketList from './TicketList';
import TicketDetails from './TicketDetails';

const TicketSystem = ({ isAdmin }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTicketCreated = () => {
    setShowCreateForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTicketUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'Ticket Management' : 'Support Tickets'}
        </h1>
        {!isAdmin && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Create New Ticket'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateTicket onTicketCreated={handleTicketCreated} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedTicket ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <TicketList 
            key={refreshTrigger}
            onTicketSelect={setSelectedTicket}
          />
        </div>
        
        {selectedTicket && (
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Ticket Details
                </h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <TicketDetails
                ticket={selectedTicket}
                isAdmin={isAdmin}
                onUpdate={handleTicketUpdated}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TicketSystem.propTypes = {
  isAdmin: PropTypes.bool.isRequired
};

export default TicketSystem;
