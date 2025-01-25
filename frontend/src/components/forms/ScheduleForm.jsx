import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../form-components/InputField.jsx";
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption.jsx"; // Use the new component
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
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch subjects on component mount
  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      try {
        const subjectsData = await fetchSubjects();
        const formattedSubjects = subjectsData.map((sub) => ({
          label: sub.name,
          value: sub._id,
        }));
        setSubjects(formattedSubjects);
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

  // Add a new room to the list
  const addRoom = () => {
    if (newRoom.trim()) {
      setRooms([...rooms, newRoom.trim()]);
      setNewRoom("");
    }
  };

  // Handle changes to room inputs
  const handleRoomChange = (e, index) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = e.target.value;
    setRooms(updatedRooms);
  };

  // Remove a room from the list
  const removeRoom = (index) => {
    const updatedRooms = [...rooms];
    updatedRooms.splice(index, 1);
    setRooms(updatedRooms);
  };

  // Handle form submission
  const onSubmit = async (formData) => {
    console.log("Form data:", formData);

    const payload = {
      subject: formData.subject.value, // Use `value` for the selected subject
      date: formData.date,
      shift: formData.shift,
      rooms: rooms, // Use local state for rooms
      standard: formData.standard,
    };

    console.log("Payload:", payload);

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
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
      {loading && <p className="text-center text-blue-600">Loading...</p>}
      {errorMessage && <p className="text-center text-red-600 mb-4">{errorMessage}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Subject Section */}
        <SingleSelectWithAddOption
          options={subjects}
          placeholder="Select or create a subject"
          onOptionCreate={handleAddSubject}
          onSelectionChange={(selectedOption) => setValue("subject", selectedOption)}
        />

        <InputField
          label="Date"
          type="date"
          register={register("date", { required: "Please select a date" })}
          error={errors.date}
        />

        <SingleSelectWithAddOption
          options={[
            { label: "Morning", value: "Morning" },
            { label: "Evening", value: "Evening" },
          ]}
          placeholder="Select shift"
          onSelectionChange={(selectedOption) => setValue("shift", selectedOption)}
        />

        {/* Rooms Section */}
        <div>
          <label className="block mb-2">Rooms</label>
          {rooms.map((room, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                {...register(`rooms.${index}`, { required: "Room cannot be empty" })}
                value={room}
                onChange={(e) => handleRoomChange(e, index)}
                className="border rounded px-2 py-1 w-full"
              />
              <button
                type="button"
                onClick={() => removeRoom(index)}
                className="px-2 py-1 bg-red-600 text-white rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              placeholder="Add a room"
            />
            <button
              type="button"
              onClick={addRoom}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Add
            </button>
          </div>
        </div>

        <InputField label="Standard" type="text" register={register("standard")} />

        <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded-md shadow hover:bg-green-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ScheduleForm;
