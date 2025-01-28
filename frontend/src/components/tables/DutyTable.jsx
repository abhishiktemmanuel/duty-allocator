import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getDuties } from '../../services/backendApi';

const DutyTable = () => {
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDuties = async () => {
    try {
      const response = await getDuties();
      setDuties(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading duties:', err);
      setError('Failed to load duties');
      setDuties([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDuties();
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
            <th scope="col" className="py-3 px-6">Date</th>
            <th scope="col" className="py-3 px-6">Shift</th>
            <th scope="col" className="py-3 px-6">Subject</th>
            <th scope="col" className="py-3 px-6">Room</th>
            <th scope="col" className="py-3 px-6">Invigilator 1</th>
            <th scope="col" className="py-3 px-6">Invigilator 2</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(duties) && duties.length > 0 ? (
            duties.map((duty) => (
              <tr 
                key={duty._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="py-4 px-6">
                  {format(new Date(duty.date), 'dd/MM/yyyy')}
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    duty.shift === 'Morning' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {duty.shift}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {duty.subject?.name || 'N/A'}
                </td>
                <td className="py-4 px-6">
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {duty.room || 'N/A'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-800">
                        {duty.invidulator1?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-300">
                      {duty.invidulator1?.name || 'Not assigned'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-800">
                        {duty.invidulator2?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-300">
                      {duty.invidulator2?.name || 'Not assigned'}
                    </span>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4">
                No duties assigned yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DutyTable;
