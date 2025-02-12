import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fetchExamSchedules, deleteSchedule, updateSchedule, fetchSubjects } from '../../services/backendApi';
import { exportToCSV } from '../../services/csvExport';

const ScheduleTable = () => {
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  const loadSchedules = async () => {
    try {
      const response = await fetchExamSchedules();
      setSchedules(response.message || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading schedules:', err);
      setError('Add schedules, no data found to display');
      setSchedules([]);
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData.map(sub => ({ label: sub.name, value: sub._id })));
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError('Failed to load subjects');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    loadSchedules();
    loadSubjects();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e, field) => {
    const { value } = e.target;
    setEditingSchedule(prev => ({
      ...prev,
      [field]: field === 'subject' 
        ? { _id: value, name: subjects.find(s => s.value === value)?.label } 
        : value
    }));
  };

  const handleExportSchedule = () => {
    const headers = [
      { label: 'Subject', key: 'subject' },
      { label: 'Date', key: 'date' },
      { label: 'Shift', key: 'shift' },
      { label: 'Rooms', key: 'rooms' },
      { label: 'Standard', key: 'standard' }
    ];

    const exportData = schedules.map(schedule => ({
      subject: schedule.subject.name,
      date: format(new Date(schedule.date), 'dd/MM/yyyy'),
      shift: schedule.shift,
      rooms: schedule.rooms.join(', '),
      standard: schedule.standard
    }));

    exportToCSV(exportData, {
      headers,
      filename: `exam-schedules-${format(new Date(), 'dd-MM-yyyy')}`
    });
  };

  const handleEdit = (scheduleId) => {
    const schedule = schedules.find(s => s._id === scheduleId);
    setEditingSchedule(schedule);
  };
  
  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(scheduleId);
        loadSchedules();
      } catch (err) {
        console.error('Error deleting schedule:', err);
        setError('Failed to delete schedule');
      }
    }
  };

  const handleUpdate = async (scheduleId, updatedData) => {
    try {
      await updateSchedule(scheduleId, updatedData);
      setEditingSchedule(null);
      loadSchedules();
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError('Failed to update schedule');
    }
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
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
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end pb-2">
        <button
          onClick={handleExportSchedule}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
        >
          Export to CSV
        </button>
      </div>

      {/* Edit Modal */}
      {editingSchedule && isMobileView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Edit Schedule</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdate(editingSchedule._id, editingSchedule);
            }} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={editingSchedule.subject._id}
                  onChange={(e) => handleInputChange(e, 'subject')}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600"
                >
                  {subjects.map((subject) => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={format(new Date(editingSchedule.date), 'yyyy-MM-dd')}
                  onChange={(e) => handleInputChange(e, 'date')}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                  Shift
                </label>
                <select
                  name="shift"
                  value={editingSchedule.shift}
                  onChange={(e) => handleInputChange(e, 'shift')}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto shadow-md rounded-lg">
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
                  {editingSchedule?._id === schedule._id ? (
                    // Edit mode
                    <>
                      <td className="py-4 px-6">
                        <select 
                          value={editingSchedule.subject._id}
                          onChange={(e) => handleInputChange(e, 'subject')}
                          className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {subjects.map((subject) => (
                            <option key={subject.value} value={subject.value}>
                              {subject.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <input 
                          type="date"
                          value={format(new Date(editingSchedule.date), 'yyyy-MM-dd')}
                          onChange={(e) => handleInputChange(e, 'date')}
                          className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <select 
                          value={editingSchedule.shift}
                          onChange={(e) => handleInputChange(e, 'shift')}
                          className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="Morning">Morning</option>
                          <option value="Evening">Evening</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <input 
                          type="text"
                          value={editingSchedule.rooms.join(', ')}
                          onChange={(e) => handleInputChange(e, 'rooms')}
                          className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <input 
                          type="text"
                          value={editingSchedule.standard}
                          onChange={(e) => handleInputChange(e, 'standard')}
                          className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            className="font-medium text-green-600 hover:underline"
                            onClick={() => handleUpdate(schedule._id, editingSchedule)}
                          >
                            Save
                          </button>
                          <button
                            className="font-medium text-gray-600 hover:underline"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View mode
                    <>
                      <td className="py-4 px-6">{schedule.subject.name}</td>
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
                              className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"
                            >
                              {room}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">{schedule.standard}</td>
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
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No schedules found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
        {Array.isArray(schedules) && schedules.length > 0 ? (
          schedules.map((schedule) => (
            <div 
              key={schedule._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {schedule.subject.name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(schedule._id)}
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(schedule._id)}
                    className="text-red-600 dark:text-red-400 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Date:</span>
                  <p className="text-gray-900 dark:text-white">
                    {format(new Date(schedule.date), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Shift:</span>
                  <p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      schedule.shift === 'Morning' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {schedule.shift}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Standard:</span>
                  <p className="text-gray-900 dark:text-white">{schedule.standard}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Rooms:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {schedule.rooms.map((room, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded"
                      >
                        {room}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No schedules found
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTable;
