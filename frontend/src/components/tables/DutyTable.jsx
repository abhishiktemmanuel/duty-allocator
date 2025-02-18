

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getDuties, updateDuty, fetchTeachers } from '../../services/backendApi';
import SelectDropdown from '../form-components/SelectDropdown';
import Papa from 'papaparse';
import PropTypes from 'prop-types';
import { exportToCSV } from '../../services/csvExport';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// FilterOverlay Component
const FilterOverlay = ({ isOpen, onClose, filters, onFilterChange, unassignedCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
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
  onFilterChange: PropTypes.func.isRequired,
  unassignedCount: PropTypes.number
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
  const [exportDate, setExportDate] = useState('');
  const [exportShift, setExportShift] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportDuties = () => {
    const headers = [
      { label: 'Room', key: 'room' },
      { label: 'Date', key: 'date' },
      { label: 'Shift', key: 'shift' },
      { label: 'Subject', key: 'subject' },
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


  const unassignedCount = filteredDuties.filter(
    duty => !duty.invidulator1 || !duty.invidulator2
  ).length;

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

  const handleUpdateInvigilator = async (dutyId, field, selectedTeacher) => {
    const previousDuties = [...duties];
    try {
      // Optimistic update with full teacher object
      const updatedDuties = duties.map(duty => {
        if (duty._id === dutyId) {
          return {
            ...duty,
            [field]: {
              _id: selectedTeacher.value,
              name: selectedTeacher.label
            }
          };
        }
        return duty;
      });
      
      setDuties(updatedDuties);
      setFilteredDuties(updatedDuties);

      await updateDuty(dutyId, { [field]: selectedTeacher.value });
      const { message: freshDuties } = await getDuties();
      setDuties(freshDuties);
      setFilteredDuties(freshDuties);

      setSuccessMessage("Invigilator updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setDuties(previousDuties);
      setFilteredDuties(previousDuties);
      setErrorMessage("Failed to update invigilator");
      setTimeout(() => setErrorMessage(""), 3000);
    }
    setEditingDuty(null);
  };

  const handleExportAttendance = () => {
    if (!exportDate || !exportShift) {
      setErrorMessage("Please select both date and shift");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const selectedDuties = filteredDuties.filter(duty => 
      format(new Date(duty.date), 'yyyy-MM-dd') === exportDate &&
      duty.shift === exportShift
    );

    const csvData = [];
    selectedDuties.forEach(duty => {
      csvData.push({ Room: duty.room, Invigilators: duty.invidulator1?.name || 'Unassigned' });
      csvData.push({ Room: '', Invigilators: duty.invidulator2?.name || 'Unassigned' });
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-${exportDate}-${exportShift}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportModal(false);
  };

  const ExportModal = () => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Export Attendance Sheets</h3>
          <button
            onClick={() => setShowExportModal(false)}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
  
        <div className="space-y-6">
          <div className="space-y-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={exportDate}
                onChange={(e) => setExportDate(e.target.value)}
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Shift
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={exportShift}
                onChange={(e) => setExportShift(e.target.value)}
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
  
            <button
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              onClick={handleExportAttendance}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Selected Attendance
            </button>
          </div>
  
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download complete attendance history (separate files in ZIP)
              </p>
            </div>
            <button
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              onClick={handleExportAllAttendance}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All Attendance Sheets (ZIP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const handleExportAllAttendance = async () => {
    try {
      const zip = new JSZip();
      const groupedDuties = {};
  
      // 1. Group duties by date-shift combination
      duties.forEach(duty => {
        const dateKey = format(new Date(duty.date), 'yyyy-MM-dd');
        const shiftKey = duty.shift; // Should be "Morning" or "Evening"
        const compositeKey = `${dateKey}_${shiftKey}`; // Use underscore as separator
        
        if (!groupedDuties[compositeKey]) {
          groupedDuties[compositeKey] = [];
        }
        groupedDuties[compositeKey].push(duty);
      });
  
      // 2. Create files for each date-shift combination
      for (const [compositeKey, dutiesGroup] of Object.entries(groupedDuties)) {
        // Split the composite key safely
        const [datePart, shift] = compositeKey.split('_');
        const date = new Date(datePart);
        
        // Format date as DD-MM-YYYY for filename
        const formattedDate = format(date, 'dd-MM-yyyy');
        const filename = `${formattedDate} ${shift}.csv`;
  
        // 3. Create CSV data matching single export format
        const csvData = [];
        dutiesGroup.forEach(duty => {
          csvData.push({ Room: duty.room, Invigilators: duty.invidulator1?.name || 'Unassigned' });
          csvData.push({ Room: '', Invigilators: duty.invidulator2?.name || 'Unassigned' });
        });
  
        // 4. Generate CSV
        const csv = Papa.unparse(csvData, {
          header: true,
          columns: ['Room', 'Invigilators']
        });
  
        zip.file(filename, csv);
      }
  
      // 5. Generate and download the zip file
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "attendance-sheets.zip");
      setShowExportModal(false);
    } catch (err) {
      console.error('Error generating zip file:', err);
      setErrorMessage("Failed to generate download package");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const renderInvigilatorCell = (duty, field, invigilator) => {
    const isEditing = isEditMode && editingDuty === `${duty._id}-${field}`;
    const currentTeacher = invigilator ? {
      label: invigilator.name,
      value: invigilator._id
    } : null;

    return (
      <div className="flex items-center gap-2">
        {/* Avatar circle */}
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
          <div className="w-full min-w-[120px]">
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
            <span className="text-gray-900 dark:text-gray-300 truncate">
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
  const renderMobileCard = (duty) => {
    const isUnassigned = !duty.invidulator1 || !duty.invidulator2;
    return (
      <div 
        key={duty._id}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 ${
          isUnassigned ? 'bg-red-50 dark:bg-red-900/20' : ''
        }`}
      >
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
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {duty.subject?.name || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Room:</span>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded">
              {duty.room || 'N/A'}
            </span>
          </div>

          <div className="border-t dark:border-gray-700 pt-2 mt-2 space-y-3">
            <div>
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
    <div className="space-y-4 p-2 sm:p-4">
      {unassignedCount > 0 && (
        <div className="p-2 bg-red-100 text-red-700 rounded-lg text-sm">
          {unassignedCount} unassigned rooms found
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilterOverlay(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Attendance
          </button>
          <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm ${
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
        unassignedCount={unassignedCount}
      />

      {/* Table rendering with row styling */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border dark:border-gray-700">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {['Date', 'Shift', 'Subject', 'Room', 'Invigilator 1', 'Invigilator 2'].map((header) => (
                <th key={header} scope="col" className="py-3 px-6">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDuties.map((duty) => {
              const isUnassigned = !duty.invidulator1 || !duty.invidulator2;
              return (
                <tr 
                  key={duty._id}
                  className={`border-b dark:border-gray-700 ${isUnassigned ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'} hover:bg-gray-50 dark:hover:bg-gray-600`}
                >
                  <td className="py-4 px-6">{format(new Date(duty.date), 'dd/MM/yyyy')}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      duty.shift === 'Morning' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' 
                      : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100'
                    }`}>
                      {duty.shift}
                    </span>
                  </td>
                  <td className="py-4 px-6">{duty.subject?.name || 'N/A'}</td>
                  <td className="py-4 px-6">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded">
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
              );
            })}
          </tbody>
        </table>

      </div>

      {/* Mobile Cards */}
      <div className="block sm:hidden space-y-3">
        {filteredDuties.length > 0 ? (
          filteredDuties.map(renderMobileCard)
        ) : (
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
            No duties found
          </div>
        )}
      </div>
      {showExportModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-xl">
      <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Export Attendance
        </h3>
        <button
          onClick={() => setShowExportModal(false)}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={exportDate}
              onChange={(e) => setExportDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Shift
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={exportShift}
              onChange={(e) => setExportShift(e.target.value)}
            >
              <option value="">Select Shift</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div>

          {errorMessage && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
              {errorMessage}
            </div>
          )}

          <button
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={handleExportAttendance}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Selected Attendance
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download complete attendance history (ZIP archive)
            </p>
          </div>
          <button
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={handleExportAllAttendance}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Download All Attendance Sheets
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};


export default DutyTable;