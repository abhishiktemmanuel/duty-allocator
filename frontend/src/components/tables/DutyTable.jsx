import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getDuties, updateDuty, fetchTeachers } from '../../services/backendApi';
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption";
import { exportToCSV } from '../../services/csvExport';

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
      setError('Duties will appear here once they are assigned');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportDuties = () => {
    const headers = [
      { label: 'Date', key: 'date' },
      { label: 'Shift', key: 'shift' },
      { label: 'Subject', key: 'subject' },
      { label: 'Room', key: 'room' },
      { label: 'Invigilator 1', key: 'invigilator1' },
      { label: 'Invigilator 2', key: 'invigilator2' }
    ];

    const exportData = duties.map(duty => ({
      date: format(new Date(duty.date), 'dd/MM/yyyy'),
      shift: duty.shift,
      subject: duty.subject?.name || 'N/A',
      room: duty.room || 'N/A',
      invigilator1: duty.invidulator1?.name || 'Not assigned',
      invigilator2: duty.invidulator2?.name || 'Not assigned'
    }));

    exportToCSV(exportData, {
      headers,
      filename: `duty-assignments-${format(new Date(), 'dd-MM-yyyy')}`
    });
  };

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
    
            <div className="border-t dark:border-gray-700 pt-2 mt-2">
              <div className="mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                  Invigilator 1:
                </span>
                {renderInvigilatorCell(duty, 'invidulator1', duty.invidulator1)}
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                  Invigilator 2:
                </span>
                {renderInvigilatorCell(duty, 'invidulator2', duty.invidulator2)}
              </div>
            </div>
          </div>
        </div>
      );
    };
      
    return (
      <div className="space-y-4 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Duty Assignments</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportDuties}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              Export to CSV
            </button>
            <button
              onClick={toggleEditMode}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-colors duration-200 ${
                isEditMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
            </button>
          </div>
        </div>
  
        {/* Success and Error Messages */}
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
  
        {/* Responsive Table/Cards */}
        <div className="hidden sm:block">
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
                    <td colSpan="6" className="text-center py-4">No duties assigned yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="block sm:hidden">
          {Array.isArray(duties) && duties.length > 0 ? (
            duties.map(renderMobileCard)
          ) : (
            <div className="text-center py-4 bg-white rounded-lg">
              No duties assigned yet
            </div>
          )}
        </div>
      </div>
    );

  
};

export default DutyTable;
  // return (
  //   <div className="space-y-4">
  //     <div className="flex justify-between items-center">
  //       <h2 className="text-xl font-semibold text-gray-900">Duty Assignments</h2>
  //       <div className="flex gap-2">
  //         <button
  //           onClick={handleExportDuties}
  //           className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
  //         >
  //           Export to CSV
  //         </button>
  //         <button
  //           onClick={toggleEditMode}
  //           className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
  //             isEditMode 
  //               ? 'bg-red-600 hover:bg-red-700 text-white'
  //               : 'bg-blue-600 hover:bg-blue-700 text-white'
  //           }`}
  //         >
  //           {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
  //         </button>
  //       </div>
  //     </div>

  //     {successMessage && (
  //       <div className="p-4 text-green-700 bg-green-100 border border-green-300 rounded-lg">
  //         {successMessage}
  //       </div>
  //     )}

  //     {errorMessage && (
  //       <div className="p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
  //         {errorMessage}
  //       </div>
  //     )}

  //     <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
  //       <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
  //         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
  //           <tr>
  //             <th scope="col" className="py-3 px-6">Date</th>
  //             <th scope="col" className="py-3 px-6">Shift</th>
  //             <th scope="col" className="py-3 px-6">Subject</th>
  //             <th scope="col" className="py-3 px-6">Room</th>
  //             <th scope="col" className="py-3 px-6">Invigilator 1</th>
  //             <th scope="col" className="py-3 px-6">Invigilator 2</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {Array.isArray(duties) && duties.length > 0 ? (
  //             duties.map((duty) => (
  //               <tr key={duty._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
  //                 <td className="py-4 px-6">{format(new Date(duty.date), 'dd/MM/yyyy')}</td>
  //                 <td className="py-4 px-6">
  //                   <span className={`px-2 py-1 rounded-full text-xs ${
  //                     duty.shift === 'Morning' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  //                   }`}>
  //                     {duty.shift}
  //                   </span>
  //                 </td>
  //                 <td className="py-4 px-6">{duty.subject?.name || 'N/A'}</td>
  //                 <td className="py-4 px-6">
  //                   <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
  //                     {duty.room || 'N/A'}
  //                   </span>
  //                 </td>
                  
  //                 <td className="py-4 px-6">
  //                   {renderInvigilatorCell(duty, 'invidulator1', duty.invidulator1)}
  //                 </td>
  //                 <td className="py-4 px-6">
  //                   {renderInvigilatorCell(duty, 'invidulator2', duty.invidulator2)}
  //                 </td>
  //               </tr>
  //             ))
  //           ) : (
  //             <tr>
  //               <td colSpan="7" className="text-center py-4">No duties assigned yet</td>
  //             </tr>
  //           )}
  //         </tbody>
  //       </table>
  //     </div>
  //   </div>
  // );
  