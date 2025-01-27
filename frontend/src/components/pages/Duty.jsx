import { useState } from 'react';
import { setDuty } from '../../services/backendApi';

function Duty() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSetDuty = async () => {
    try {
      setLoading(true);
      setError(null);
      await setDuty();
      // Refresh the table after successful duty set
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pl-2 mb-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Duties
        </h1>
        <button
          onClick={handleSetDuty}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                     disabled:bg-blue-300 disabled:cursor-not-allowed
                     transition-colors duration-200"
        >
          {loading ? 'Setting Duty...' : 'Set Duty'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* <DutyTable key={refreshKey} /> */}
    </div>
  );
}

export default Duty;
