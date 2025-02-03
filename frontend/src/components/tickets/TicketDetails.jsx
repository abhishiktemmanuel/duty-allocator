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
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2 break-words">
          {ticket.title}
        </h2>
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
          <TicketStatus status={ticket.status} />
          <TicketPriority priority={ticket.priority} />
        </div>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
          {ticket.description}
        </p>
      </div>

      {isAdmin && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Update Status
          </h3>
          <div className="flex flex-wrap gap-2">
            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={loading || ticket.status === status}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    ticket.status === status
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                  } disabled:opacity-50`}
                aria-label={`Set status to ${status.replace('_', ' ')}`}
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
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4"
            >
              <p className="text-gray-600 dark:text-gray-300 break-words">
                {comment.text}
              </p>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">{comment.createdBy.name}</span>
                <span className="mx-1">•</span>
                <time dateTime={comment.createdAt}>
                  {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
                </time>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleAddComment} className="space-y-4">
        <div>
          <label 
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Add Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white
              disabled:opacity-50 disabled:cursor-not-allowed"
            required
            disabled={loading}
            placeholder="Type your comment here..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 text-white bg-blue-600 rounded-md
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
            focus:ring-offset-2 dark:focus:ring-offset-gray-800
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      {error && (
        <div role="alert" className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
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
