import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';
import Papa from 'papaparse'; // Import PapaParse for CSV parsing
import InputField from "../form-components/InputField.jsx";
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption.jsx";
import InputWithAddOption from "../form-components/InputWithAddOption.jsx";
import { fetchSubjects, addSubject, submitSchedule, submitBulkSchedules } from "../../services/backendApi.js";

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const ScheduleForm = ({ onScheduleAdded }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subject: null,
      date: "",
      shift: "",
      standard: "",
      rooms: []
    }
  });

  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [csvFile, setCsvFile] = useState(null); // State for CSV file
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const watchedSubject = watch("subject");

  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      try {
        const subjectsData = await fetchSubjects();
        setSubjects(subjectsData.map((sub) => ({ label: sub.name, value: sub._id })));
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setErrorMessage("Please add subjects, no subject data found.");
        setTimeout(() => setErrorMessage(""), 3000);
      } finally {
        setLoading(false);
      }
    };
    loadSubjects();
  }, []);

  const handleAddSubject = async (newSubject) => {
    setIsAddingSubject(true);
    try {
      const subjectName = typeof newSubject === 'string' ? newSubject : newSubject.label;
      const addedSubject = await addSubject(subjectName);
      
      if (!addedSubject || !addedSubject.name || !addedSubject._id) {
        throw new Error("Invalid response from addSubject");
      }
      
      const newOption = { label: addedSubject.name, value: addedSubject._id };
      setSubjects(prevSubjects => [...prevSubjects, newOption]);
      setValue("subject", newOption, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      return newOption;
    } catch (error) {
      console.error("Failed to add subject:", error);
      setErrorMessage("Failed to add new subject. Please try again later.");
      setTimeout(() => setErrorMessage(""), 3000);
      return null;
    } finally {
      setIsAddingSubject(false); // End loading
    }
  };

  const handleRoomsChange = (selectedRooms) => {
    if (!selectedRooms) {
      setRooms([]);
      setValue('rooms', []);
      return;
    }
  
    const formattedRooms = selectedRooms.map(room => ({
      value: typeof room === 'string' ? room : room.value,
      label: typeof room === 'string' ? room : (room.label || room.value)
    }));
  
    setRooms(formattedRooms);
    setValue('rooms', formattedRooms, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };
  
  const validateForm = (formData) => {
    if (!formData.subject || !formData.subject.value) {
      setErrorMessage("Please select or create a subject");
      return false;
    }
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      setErrorMessage("Please add at least one room");
      return false;
    }
    if (!formData.date) {
      setErrorMessage("Please select a date");
      return false;
    }
    if (!formData.shift) {
      setErrorMessage("Please select a shift");
      return false;
    }
    if (!formData.standard) {
      setErrorMessage("Please enter a standard");
      return false;
    }
    return true;
  };
  
  const resetForm = () => {
    reset({
      subject: null,
      date: "",
      shift: "",
      standard: "",
      rooms: []
    });
    setRooms([]);
    setValue("subject", null, { shouldValidate: true });
  };

  const onSubmit = async (formData) => {
    if (!validateForm(formData)) {
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const payload = {
      subject: formData.subject.value,
      date: formData.date,
      shift: formData.shift,
      rooms: rooms.map(room => room.value),
      standard: formData.standard,
    };

    try {
      await submitSchedule(payload);
      resetForm();
      setSuccessMessage("Schedule added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      if (onScheduleAdded) onScheduleAdded();
    } catch (error) {
      console.error("Failed to add schedule:", error);
      setErrorMessage("Failed to submit the form. Please try again later.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Handle CSV file upload and bulk import
  const handleCSVImport = async () => {
    if (!csvFile) {
      setErrorMessage("Please select a CSV file first.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
  
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
  
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const response = await submitBulkSchedules(results.data);
          
          if (response.errorCount > 0) {
            setErrorMessage(
              `Imported ${response.successCount} schedules. ${response.errorCount} errors found. ` +
              `First error: ${response.sampleError?.error} (Row ${response.sampleError?.row})`
            );
          } else {
            setSuccessMessage(`Successfully imported ${response.successCount} schedules`);
          }
  
          if (response.errors?.length > 0) {
            console.error("Detailed errors:", response.errors);
            // Optionally show modal with full error list
          }
  
          if (onScheduleAdded) onScheduleAdded();
        } catch (error) {
          setErrorMessage("Failed to import CSV. Please check the file format.");
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setLoading(false);
        setErrorMessage("Error parsing CSV file: " + error.message);
      }
    });
  };
    
  // Handle file drop
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      setErrorMessage("Please upload a valid CSV file.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      setErrorMessage("Please upload a valid CSV file.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="relative mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
      {loading && (
        <p className="text-center text-blue-500 font-semibold mb-4">Loading...</p>
      )}

      {successMessage && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 border border-green-300 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {errorMessage}
        </div>
      )}

<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  {/* Rooms Row - Full Width */}
  <div className="w-full">
    <InputWithAddOption
      value={rooms}
      onRoomsChange={handleRoomsChange}
      placeholder="Add rooms..."
      error={errors.rooms}
    />
  </div>

  {/* Subject + Standard Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Subject Column */}
    <div className="w-full">
      <SingleSelectWithAddOption
        options={subjects}
        placeholder="Select subject"
        value={watchedSubject}
        onOptionCreate={handleAddSubject}
        onSelectionChange={(selectedOption) => {
          setValue("subject", selectedOption, { 
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });
        }}
        isSearchable={true}
        isClearable={true}
      />
    </div>

    {/* Standard Column */}
    <div className="w-full">
      <select 
        id="standard"
        {...register("standard", { required: "Standard is required" })}
        className="input-field w-full bg-white border rounded-full border-gray-300 text-gray-800 text-left indent-1
      focus:ring-blue-500 focus:border-blue-500 block px-3  sm:text-base"
      >
        <option value="" disabled>Select standard</option>
        <option value="Intermediate">Intermediate</option>
        <option value="High School">High School</option>
        <option value="First Year">First Year</option>
        {[...Array(12)].map((_, i) => (
          <option key={i+1} value={`${i+1}${getOrdinal(i+1)}`}>
            {i+1}{getOrdinal(i+1)}
          </option>
        ))}
      </select>
      {errors.standard && (
        <p className="mt-1 text-sm text-red-600">{errors.standard.message}</p>
      )}
    </div>
  </div>

  {/* Date + Shift Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Date Input */}
    <div className="w-full">
      <InputField
        id="scheduleDate"
        type="date"
        register={register("date", { required: "Please select a date" })}
        error={errors.date}
        className="w-full bg-white border rounded-[20rem] border-gray-300 text-gray-800 px-3 py-2
                   focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    {/* Shift Select */}
    <div className="w-full">
      <select
        id="shift"
        {...register("shift", { required: "Please select a shift" })}
        className="input-field w-full bg-white border rounded-full border-gray-300 text-gray-800 text-left indent-1
      focus:ring-blue-500 focus:border-blue-500 block px-3  sm:text-base"
      >
        <option value="" disabled>Select shift</option>
        <option value="Morning">Morning</option>
        <option value="Evening">Evening</option>
      </select>
      {errors.shift && (
        <p className="mt-1 text-sm text-red-600">{errors.shift.message}</p>
      )}
    </div>
  </div>

  {/* Buttons Row */}
  <div className="flex flex-col md:flex-row gap-3 justify-end mt-6">
    <button
      type="submit" 
      disabled={isAddingSubject}
      className={`w-full md:w-auto px-5 py-2.5 rounded-lg font-medium text-sm transition-colors
        ${isAddingSubject 
          ? 'bg-blue-400 text-white cursor-not-allowed' 
          : 'bg-blue-700 text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300'}`}
    >
      Submit
    </button>
    
    <button
      type="button"
      onClick={() => setIsModalOpen(true)}
      className="w-full md:w-auto px-5 py-2.5 bg-green-500 text-white rounded-lg
                 font-medium text-sm hover:bg-green-600 transition-colors"
    >
      Import CSV
    </button>
  </div>
</form>

      {/* Modal Overlay */}
      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Import Exam Schedules
        </h3>
        <button
          onClick={() => {
            setIsModalOpen(false);
            setCsvFile(null);
          }}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>CSV Format Requirements:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Columns: subject, date, shift, rooms, standard</li>
            <li>Date formats: YYYY-MM-DD, DD/MM/YYYY, MM-DD-YYYY</li>
            <li>Shift values: Morning or Evening (any case)</li>
            <li>Rooms: comma-separated values</li>
            <li>First row should be headers</li>
          </ul>
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed ${
          csvFile ? "border-green-500" : "border-gray-300 dark:border-gray-600"
        } rounded-lg p-8 text-center transition-all duration-200`}
        onDrop={handleFileDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("border-blue-500");
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-blue-500");
        }}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg
            className={`w-12 h-12 ${
              csvFile ? "text-green-500" : "text-gray-400"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          <div className="space-y-1">
            {csvFile ? (
              <>
                <p className="font-medium text-gray-700 dark:text-gray-200">
                  {csvFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(csvFile.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-200">
                  Drag and drop CSV file here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or browse files
                </p>
              </>
            )}
          </div>
        </div>
        
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="hidden"
          id="csvFileInput"
        />
        <label
          htmlFor="csvFileInput"
          className="mt-4 inline-block px-4 py-2 bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
        >
          Choose File
        </label>
      </div>

      {/* Processing Feedback */}
      {loading && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center space-x-3">
          <div className="animate-spin h-5 w-5 text-blue-500" />
          <span className="text-gray-600 dark:text-gray-300">
            Processing {csvFile?.name}...
          </span>
        </div>
      )}

      {/* Error/Success Messages */}
      {errorMessage && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-600 dark:text-red-400 font-medium">
              Import Issues Found
            </span>
            <button 
              onClick={() => setErrorMessage("")}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-red-500 dark:text-red-400">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => {
            setIsModalOpen(false);
            setCsvFile(null);
          }}
          className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={handleCSVImport}
          disabled={!csvFile || loading}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !csvFile || loading
              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {loading ? "Importing..." : "Start Import"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

ScheduleForm.propTypes = {
  onScheduleAdded: PropTypes.func
};

export default ScheduleForm;