import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';
import InputField from "../form-components/InputField.jsx";
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption.jsx";
import InputWithAddOption from "../form-components/InputWithAddOption.jsx";
import { fetchSubjects, addSubject, submitSchedule } from "../../services/backendApi.js";

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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
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
            <InputWithAddOption
              value={rooms}
              onRoomsChange={handleRoomsChange}
              placeholder="Add rooms..."
              error={errors.rooms}
            />
          </div>

          <button
            type="submit"
            className="absolute bottom-0 right-0 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

ScheduleForm.propTypes = {
  onScheduleAdded: PropTypes.func
};

export default ScheduleForm;