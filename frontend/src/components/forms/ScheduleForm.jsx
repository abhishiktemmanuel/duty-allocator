import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';
import Papa from 'papaparse'; // Import PapaParse for CSV parsing
import InputField from "../form-components/InputField.jsx";
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption.jsx";
import InputWithAddOption from "../form-components/InputWithAddOption.jsx";
import { fetchSubjects, addSubject, submitSchedule, submitBulkSchedules } from "../../services/backendApi.js";

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
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}`);
  };
  
  const handleCSVImport = async () => {
    if (!csvFile) {
      setErrorMessage("Please select a CSV file first.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
  
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log("Raw Parsed CSV Data:", results); // Debugging: Log raw parsed data
        const rows = results.data;
        const errors = [];
        const schedules = [];
  
        for (let index = 0; index < rows.length; index++) {
          const row = rows[index];
          console.log(`Processing Row ${index + 1}:`, row); // Debugging: Log each row
  
          // Explicitly map headers to lowercase keys
          const subjectName = row.Subject || row.subject; // Handle both cases
          const date = row.Date || row.date;
          const shift = row.Shift || row.shift;
          const roomsString = row.Rooms || row.rooms;
          const standard = row.Standard || row.standard;
  
          // Validate subject
          if (!subjectName) {
            errors.push(`Row ${index + 1}: Subject is missing`);
            continue;
          }
  
          // Check if the subject exists
          let subject = subjects.find((sub) => sub.label === subjectName);
  
          // If the subject doesn't exist, create it
          if (!subject) {
            try {
              const newSubject = await addSubject(subjectName);
              if (!newSubject || !newSubject.name || !newSubject._id) {
                errors.push(`Row ${index + 1}: Failed to create subject '${subjectName}'`);
                continue;
              }
  
              // Add the new subject to the state
              const newOption = { label: newSubject.name, value: newSubject._id };
              setSubjects((prevSubjects) => [...prevSubjects, newOption]);
              subject = newOption;
            } catch (error) {
              console.error("Failed to add subject:", error);
              errors.push(`Row ${index + 1}: Failed to create subject '${subjectName}'`);
              continue;
            }
          }
  
          // Validate date
          const dateObj = parseDate(date); // Use the custom date parser
          if (isNaN(dateObj)) {
            errors.push(`Row ${index + 1}: Invalid date format`);
            continue;
          }
  
          // Validate shift
          if (!["Morning", "Evening"].includes(shift)) {
            errors.push(`Row ${index + 1}: Invalid shift value`);
            continue;
          }
  
          // Validate rooms
          const roomsArray = roomsString.split(",").map((room) => room.trim());
          if (roomsArray.length === 0) {
            errors.push(`Row ${index + 1}: At least one room required`);
            continue;
          }
  
          // Validate standard
          if (!standard) {
            errors.push(`Row ${index + 1}: Standard is required`);
            continue;
          }
  
          schedules.push({
            subject: subject.value,
            date: dateObj.toISOString().split("T")[0], // Format as YYYY-MM-DD
            shift,
            rooms: roomsArray,
            standard,
          });
        }
  
        if (errors.length > 0) {
          setErrorMessage(`CSV Errors: ${errors.join("; ")}`);
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }
  
        try {
          await submitBulkSchedules(schedules);
          setSuccessMessage(`Imported ${schedules.length} schedules successfully!`);
          setTimeout(() => setSuccessMessage(""), 5000);
          if (onScheduleAdded) onScheduleAdded();
        } catch (error) {
          console.error("Bulk upload failed:", error);
          setErrorMessage("Failed to import CSV. Please check the file format.");
          setTimeout(() => setErrorMessage(""), 5000);
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        setErrorMessage("Error parsing CSV file");
        setTimeout(() => setErrorMessage(""), 3000);
      },
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
      <div>
            <InputWithAddOption
              value={rooms}
              onRoomsChange={handleRoomsChange}
              placeholder="Add rooms..."
              error={errors.rooms}
            />
          </div>
        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InputField
            id="scheduleDate"
            type="date"
            register={register("date", { required: "Please select a date" })}
            error={errors.date}
            placeholder="Select date"
            className="bg-white border rounded-[20rem] border-gray-300 text-gray-800 text-left indent-2 border-radius-[20rem]
                      focus:ring-blue-500 focus:border-blue-500 block w-full"
          />

          <div>
            <select
              id="shift"
              {...register("shift", { required: "Please select a shift" })}
              className="bg-white border rounded-[20rem] border-gray-300 text-gray-800 indent-2 focus:ring-blue-500 focus:border-blue-500 block w-full"
            >
              <option value="" disabled>Select shift</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
            {errors.shift && (
              <p className="mt-1 text-sm text-red-600">{errors.shift.message}</p>
            )}
          </div>

          <InputField
            id="scheduleStandard"
            type="text"
            register={register("standard", { required: "Standard is required" })}
            error={errors.standard}
            placeholder="Enter standard"
            className="bg-white border rounded-[20rem] border-gray-300 text-gray-800 text-left indent-2 border-radius-[20rem]
                      focus:ring-blue-500 focus:border-blue-500 block w-full"
          />
        </div>

        <div>
        <div className="w-lg align mb-6">
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
          <div className="absolute bottom-0 right-0">

          <button
            type="submit"
            className=" text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>
          <button
          onClick={() => setIsModalOpen(true)}
          className="  bg-green-500 text-white font-medium rounded-lg text-sm px-5 ml-3 py-2.5 hover:bg-green-600"
        >
          Import CSV
        </button>
        </div>
        </div>
      </form>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload CSV File</h3>
            <p className="mt-2 text-sm text-gray-500">
          CSV format: subject,date,shift,rooms,standard (rooms comma-separated)
        </p>
            <div
              className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer"
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <p>Drag and drop a CSV file here, or</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
                id="csvFileInput"
              />
              <label
                htmlFor="csvFileInput"
                className="text-blue-500 cursor-pointer"
              >
                click to select a file
              </label>
            </div>
            {csvFile && (
              <div className="mt-4">
                <p className="text-sm">Selected file: {csvFile.name}</p>
                <button
                  onClick={handleCSVImport}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
                >
                  Import CSV
                </button>
              </div>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
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