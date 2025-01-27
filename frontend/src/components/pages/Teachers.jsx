import { useState } from 'react';
import TeacherForm from '../forms/TeacherForm';
import TeacherTable from '../tables/TeachersTable';

function Teachers() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTeacherAdded = () => {
    // Increment the key to force table refresh
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-left pl-2 text-gray-900 mb-2">
        Teacher Details
      </h1>
      <TeacherForm onTeacherAdded={handleTeacherAdded} />
      <TeacherTable key={refreshKey} />
    </div>
  );
}

export default Teachers;
