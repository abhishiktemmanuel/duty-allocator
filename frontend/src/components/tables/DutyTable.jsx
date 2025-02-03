import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getDuties, updateDuty, fetchTeachers } from '../../services/backendApi';
import SelectDropdown from '../form-components/SelectDropdown';
import { exportToCSV } from '../../services/csvExport';
import PropTypes from 'prop-types';

// FilterOverlay Component
const FilterOverlay = ({ isOpen, onClose, filters, onFilterChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog positioning */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          {/* Modal panel */}
          <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            {/* Close button */}
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal content */}
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-5">
                  Filter Options
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={filters.date}
                      onChange={(e) => onFilterChange('date', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Shift
                    </label>
                    <select
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={filters.shift}
                      onChange={(e) => onFilterChange('shift', e.target.value)}
                    >
                      <option value="">All Shifts</option>
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Filter by subject"
                      value={filters.subject}
                      onChange={(e) => onFilterChange('subject', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Filter by room"
                      value={filters.room}
                      onChange={(e) => onFilterChange('room', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Invigilator
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Filter by invigilator"
                      value={filters.invigilator}
                      onChange={(e) => onFilterChange('invigilator', e.target.value)}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
                    onClick={onClose}
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={() => {
                      onFilterChange('reset', {
                        date: '',
                        shift: '',
                        subject: '',
                        room: '',
                        invigilator: ''
                      });
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


FilterOverlay.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    date: PropTypes.string,
    shift: PropTypes.string,
    subject: PropTypes.string,
    room: PropTypes.string,
    invigilator: PropTypes.string
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired
};

const DutyTable = () => {
  const [duties, setDuties] = useState([]);
  const [filteredDuties, setFilteredDuties] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingDuty, setEditingDuty] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    shift: '',
    subject: '',
    room: '',
    invigilator: ''
  });

  const loadData = async () => {
    try {
      const [dutiesResponse, teachersResponse] = await Promise.all([
        getDuties(),
        fetchTeachers()
      ]);
      const dutiesData = dutiesResponse.message || [];
      setDuties(dutiesData);
      setFilteredDuties(dutiesData);
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

  useEffect(() => {
    const filtered = duties.filter(duty => {
      const matchDate = !filters.date || format(new Date(duty.date), 'yyyy-MM-dd') === filters.date;
      const matchShift = !filters.shift || duty.shift === filters.shift;
      const matchSubject = !filters.subject || 
        duty.subject?.name.toLowerCase().includes(filters.subject.toLowerCase());
      const matchRoom = !filters.room || 
        duty.room.toLowerCase().includes(filters.room.toLowerCase());
      const matchInvigilator = !filters.invigilator || 
        duty.invidulator1?.name.toLowerCase().includes(filters.invigilator.toLowerCase()) ||
        duty.invidulator2?.name.toLowerCase().includes(filters.invigilator.toLowerCase());

      return matchDate && matchShift && matchSubject && matchRoom && matchInvigilator;
    });
    setFilteredDuties(filtered);
  }, [filters, duties]);

  const handleFilterChange = (field, value) => {
    if (field === 'reset') {
      setFilters(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleExportDuties = () => {
    const headers = [
      { label: 'Date', key: 'date' },
      { label: 'Shift', key: 'shift' },
      { label: 'Subject', key: 'subject' },
      { label: 'Room', key: 'room' },
      { label: 'Invigilator 1', key: 'invigilator1' },
      { label: 'Invigilator 2', key: 'invigilator2' }
    ];

    const exportData = filteredDuties.map(duty => ({
      date: format(new Date(duty.date), 'dd/MM/yyyy'),
      shift: duty.shift,
      subject: duty.subject?.name || 'N/A',
      room: duty.room || 'N/A',
      invigilator1: duty.invidulator1?.name || 'Unassigned',
      invigilator2: duty.invidulator2?.name || 'Unassigned'
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
    setEditingDuty(null);
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
            {invigilator?.name?.split(' ')
              .filter(word => !['prof', 'dr', 'mr', 'ms', 'mrs'].includes(word.toLowerCase()))
              .slice(0, 1)
              .map(word => word.charAt(0))
              || '?'}
          </span>
        </div>
        {isEditing ? (
          <div className="w-64">
            <SelectDropdown
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
              {invigilator?.name || 'Unassigned'}
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

  const renderMobileCard = (duty) => (
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowFilterOverlay(true)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {Object.values(filters).some(value => value !== '') && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                {Object.values(filters).filter(value => value !== '').length}
              </span>
            )}
          </button>
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

      <FilterOverlay 
        isOpen={showFilterOverlay}
        onClose={() => setShowFilterOverlay(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

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

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto relative shadow-md sm:rounded-lg">
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
            {filteredDuties.length > 0 ? (
              filteredDuties.map((duty) => (
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
                <td colSpan="6" className="text-center py-4">No duties found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="block sm:hidden">
        {filteredDuties.length > 0 ? (
          filteredDuties.map(renderMobileCard)
        ) : (
          <div className="text-center py-4 bg-white dark:bg-gray-800 rounded-lg">
            No duties found
          </div>
        )}
      </div>
    </div>
  );
};

export default DutyTable;