import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getDuties } from '../../services/backendApi';

const TeacherDutyTable = () => {
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      // TODO: Replace with actual API call to get teacher-specific duties
      const dutiesResponse = await getDuties();
      setDuties(dutiesResponse.message || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Unable to load your duties at the moment');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderMobileCard = (duty) => {
    return (
      <div key={duty._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {format(new Date(duty.date), 'dd/MM/yyyy')}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${
            duty.shift === 'Morning' 
              ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' 
              : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100'
          }`}>
            {duty.shift}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Subject:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {duty.subject?.name || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Room:</span>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded">
              {duty.room || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Co-Invigilator:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {(duty.invidulator1?.name === 'LOGGED_IN_TEACHER' ? duty.invidulator2?.name : duty.invidulator1?.name) || 'None'}
            </span>
          </div>
        </div>
      </div>
    );
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
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Duties</h2>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="py-3 px-6">Date</th>
                <th scope="col" className="py-3 px-6">Shift</th>
                <th scope="col" className="py-3 px-6">Subject</th>
                <th scope="col" className="py-3 px-6">Room</th>
                <th scope="col" className="py-3 px-6">Co-Invigilator</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(duties) && duties.length > 0 ? (
                duties.map((duty) => (
                  <tr key={duty._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="py-4 px-6">{format(new Date(duty.date), 'dd/MM/yyyy')}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        duty.shift === 'Morning' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {duty.shift}
                      </span>
                    </td>
                    <td className="py-4 px-6">{duty.subject?.name || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {duty.room || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {(duty.invidulator1?.name === 'LOGGED_IN_TEACHER' ? duty.invidulator2?.name : duty.invidulator1?.name) || 'None'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">No duties assigned yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block sm:hidden">
        {Array.isArray(duties) && duties.length > 0 ? (
          duties.map(renderMobileCard)
        ) : (
          <div className="text-center py-4 bg-white dark:bg-gray-800 rounded-lg">
            No duties assigned yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDutyTable;
