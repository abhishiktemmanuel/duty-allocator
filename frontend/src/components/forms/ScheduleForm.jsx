import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../form-components/InputField.jsx";
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption.jsx";
import InputWithAddOption from "../form-components/InputWithAddOption.jsx";
import { fetchSubjects, addSubject, submitSchedule } from "../../services/backendApi.js";

const ScheduleForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]); // Store room objects
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch subjects on component mount
  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      try {
        const subjectsData = await fetchSubjects();
        setSubjects(subjectsData.map((sub) => ({ label: sub.name, value: sub._id })));
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setErrorMessage("Could not load subjects at this time.");
      } finally {
        setLoading(false);
      }
    };
    loadSubjects();
  }, []);

  // Handle adding a new subject
  const handleAddSubject = async (newSubject) => {
    try {
      const addedSubject = await addSubject(newSubject.label);
      if (!addedSubject || !addedSubject.name || !addedSubject._id) {
        throw new Error("Invalid response from addSubject");
      }
      setSubjects((prevSubjects) => [
        ...prevSubjects,
        { label: addedSubject.name, value: addedSubject._id },
      ]);
    } catch (error) {
      console.error("Failed to add subject:", error);
      alert(error.message || "Failed to add new subject. Please try again later.");
    }
  };

  // Handle form submission
  const onSubmit = async (formData) => {
    const payload = {
      subject: formData.subject.value,
      date: formData.date,
      shift: formData.shift,
      rooms: rooms.map((room) => room.value),
      standard: formData.standard,
    };

    try {
      await submitSchedule(payload);
      reset();
      setRooms([]); // Clear local state for rooms
      alert("Schedule added successfully.");
    } catch (error) {
      console.error("Failed to add schedule:", error);
      alert("Failed to submit the form. Please try again later.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
      {loading && (
        <p className="text-center text-blue-500 font-semibold mb-4">
          Loading...
        </p>
      )}
      {errorMessage && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Subject Section - Full Length */}
        <div>
          <SingleSelectWithAddOption
            options={subjects}
            placeholder="Select subject"
            onOptionCreate={handleAddSubject}
            onSelectionChange={(selectedOption) => setValue("subject", selectedOption)}
          />
        </div>

        {/* Date, Shift, and Standard Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date Field */}
          <InputField
            id="scheduleDate"
            type="date"
            register={register("date", { required: "Please select a date" })}
            error={errors.date}
            placeholder="Select date"
            className="bg-white border rounded-[20rem] border-gray-300 text-gray-800 text-left indent-2 border-radius-[20rem]
                      focus:ring-blue-500 focus:border-blue-500 block w-full"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.date.message}
            </p>
          )}

          {/* Shift Dropdown */}
          <div>
            
            <select
              id="shift"
              {...register("shift", { required: "Please select a shift" })}
              className="bg-white border rounded-[20rem] border-gray-300 text-gray-800 indent-2 focus:ring-blue-500 focus:border-blue-500 block w-full"
            >
              <option value="" disabled>
                Select shift
              </option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
            {errors.shift && (
              <p className="mt-1 text-sm text-red-600">{errors.shift.message}</p>
            )}
          </div>

          {/* Standard Field */}
          <InputField
            id="scheduleStandard"
            type="text"
            register={register("standard")}
            placeholder="Enter standard"
            className="bg-white border rounded-[20rem] border-gray-300 text-gray-800 text-left indent-2 border-radius-[20rem]
                      focus:ring-blue-500 focus:border-blue-500 block w-full"
          />
        </div>

        {/* Rooms and Submit Button */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
          {/* Rooms Section */}
          <div>
            <label className="block mb-2">Rooms</label>
            <InputWithAddOption
              onRoomsChange={(selectedRooms) => setRooms(selectedRooms)}
              placeholder="Add or select rooms..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;
