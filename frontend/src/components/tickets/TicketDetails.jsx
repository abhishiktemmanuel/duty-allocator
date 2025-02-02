// components/tickets/TicketDetails.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { updateTicketStatus, addTicketComment } from '../../services/backendApi';
import TicketStatus from './TicketStatus';
import TicketPriority from './TicketPriority';
import { format } from 'date-fns';

const TicketDetails = ({ ticket, isAdmin, onUpdate }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    setError('');
    try {
      await updateTicketStatus(ticket._id, { status: newStatus });
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addTicketComment(ticket._id, comment);
      setComment('');
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {ticket.title}
        </h2>
        <div className="flex gap-4 mb-4">
          <TicketStatus status={ticket.status} />
          <TicketPriority priority={ticket.priority} />
        </div>
        <p className="text-gray-600 dark:text-gray-300">{ticket.description}</p>
      </div>

      {isAdmin && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Update Status
          </h3>
          <div className="flex gap-2">
            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={loading || ticket.status === status}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  ticket.status === status
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Comments
        </h3>
        <div className="space-y-4">
          {ticket.comments?.map((comment, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                By {comment.createdBy.name} on{' '}
                {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleAddComment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Add Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};
TicketDetails.propTypes = {
  ticket: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        createdBy: PropTypes.shape({
          name: PropTypes.string.isRequired
        }).isRequired,
        createdAt: PropTypes.string.isRequired
      })
    )
  }).isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default TicketDetails;
