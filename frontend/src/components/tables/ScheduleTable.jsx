import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fetchExamSchedules } from '../../services/backendApi';

const ScheduleTable = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await fetchExamSchedules();
        // Ensure we're setting an array from the response
        console.log('response:', response);
        setSchedules(response.message || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading schedules:', err);
        setError('Failed to load schedules');
        setSchedules([]); // Set empty array on error
        setLoading(false);
      }
    };
    loadSchedules();
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
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6">Subject</th>
            <th scope="col" className="py-3 px-6">Date</th>
            <th scope="col" className="py-3 px-6">Shift</th>
            <th scope="col" className="py-3 px-6">Rooms</th>
            <th scope="col" className="py-3 px-6">Standard</th>
            <th scope="col" className="py-3 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(schedules) && schedules.length > 0 ? (
            schedules.map((schedule) => (
              <tr 
                key={schedule._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="py-4 px-6">
                  {schedule.subject.name}
                </td>
                <td className="py-4 px-6">
                  {format(new Date(schedule.date), 'dd/MM/yyyy')}
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    schedule.shift === 'Morning' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {schedule.shift}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1">
                    {schedule.rooms.map((room, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                      >
                        {room}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-6">
                  {schedule.standard}
                </td>
                
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      onClick={() => handleEdit(schedule._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="font-medium text-red-600 dark:text-red-500 hover:underline"
                      onClick={() => handleDelete(schedule._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-4">
                No schedules found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
