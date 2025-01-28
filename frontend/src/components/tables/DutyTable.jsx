import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getDuties, updateDuty, fetchTeachers } from '../../services/backendApi';
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption";

const DutyTable = () => {
  const [duties, setDuties] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingDuty, setEditingDuty] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const loadData = async () => {
    try {
      const [dutiesResponse, teachersResponse] = await Promise.all([
        getDuties(),
        fetchTeachers()
      ]);
      setDuties(dutiesResponse.message || []);
      setTeachers(teachersResponse.map(teacher => ({
        label: teacher.name,
        value: teacher._id
      })));
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateInvigilator = async (dutyId, field, selectedTeacher) => {
    try {
      await updateDuty(dutyId, { [field]: selectedTeacher.value });
      await loadData();
      setEditingDuty(null);
      setSuccessMessage("Invigilator updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Error updating invigilator:', err);
      setErrorMessage("Failed to update invigilator");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setEditingDuty(null); // Reset any active editing when toggling mode
  };

  const renderInvigilatorCell = (duty, field, invigilator) => {
    const isEditing = isEditMode && editingDuty === `${duty._id}-${field}`;
    const currentTeacher = invigilator ? {
      label: invigilator.name,
      value: invigilator._id
    } : null;

    return (
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-full ${field === 'invidulator1' ? 'bg-blue-100' : 'bg-purple-100'} flex items-center justify-center`}>
          <span className={`text-sm font-medium ${field === 'invidulator1' ? 'text-blue-800' : 'text-purple-800'}`}>
            {invigilator?.name?.charAt(0) || '?'}
          </span>
        </div>
        {isEditing ? (
          <div className="w-64">
            <SingleSelectWithAddOption
              options={teachers}
              placeholder="Select teacher"
              value={currentTeacher}
              onSelectionChange={(selectedOption) => {
                handleUpdateInvigilator(duty._id, field, selectedOption);
              }}
            />
          </div>
        ) : (
          <>
            <span className="text-gray-900 dark:text-gray-300">
              {invigilator?.name || 'Not assigned'}
            </span>
            {isEditMode && (
              <button 
                onClick={() => setEditingDuty(`${duty._id}-${field}`)}
                className="text-blue-500 hover:text-blue-700 ml-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </>
        )}
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Duty Assignments</h2>
        <button
          onClick={toggleEditMode}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            isEditMode 
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </button>
      </div>

      {successMessage && (
        <div className="p-4 text-green-700 bg-green-100 border border-green-300 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {errorMessage}
        </div>
      )}

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
                    {renderInvigilatorCell(duty, 'invidulator1', duty.invidulator1)}
                  </td>
                  <td className="py-4 px-6">
                    {renderInvigilatorCell(duty, 'invidulator2', duty.invidulator2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">No duties assigned yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DutyTable;
