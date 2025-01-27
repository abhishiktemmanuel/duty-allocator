import { useState } from 'react';
import ScheduleForm from '../forms/ScheduleForm'
import ScheduleTable from '../tables/ScheduleTable'

function Schedule() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleScheduleAdded = () => {
    // Increment the key to force table refresh
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-left pl-2 text-gray-900 mb-2">
        Exam Schedule
      </h1>
      <ScheduleForm onScheduleAdded={handleScheduleAdded} />
      <ScheduleTable key={refreshKey} />
    </div>
  );
}



export default Schedule;





