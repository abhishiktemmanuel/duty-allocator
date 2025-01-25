import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../form-components/InputField.jsx";
import MultiSelectWithAddOption from "../form-components/MultiSelectWithAddOption.jsx"; 
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption.jsx"; // Import the new component
import { fetchSubjects, fetchSchools, addSubject, addSchool, submitTeacher } from "../../services/backendApi.js";

const TeacherForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const [subjects, setSubjects] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch available subjects and schools on component load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const subjectsData = await fetchSubjects();
        const schoolsData = await fetchSchools();
        const formattedSubjects = subjectsData.map((sub) => ({
          label: sub.name,
          value: sub._id,
        }));
        const formattedSchools = schoolsData.map((school) => ({
          label: school.name,
          value: school._id,
        }));

        setSubjects(formattedSubjects);
        setSchools(formattedSchools);
      } catch (error) {
        console.error("Failed to load data:", error);
        setErrorMessage("Failed to fetch subjects or schools. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle form submission
  const onSubmit = async (formData) => {
    const payload = {
      name: formData.name,
      subjects: formData.subjects.map((sub) => sub.value),
      school: formData.school.value, // Use `value` for the selected school
    };

    try {
      await submitTeacher(payload);
      reset();
      alert("Teacher added successfully.");
    } catch (error) {
      console.error("Failed to add teacher:", error);
      alert("Failed to submit the form. Please try again later.");
    }
  };

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

  // Handle adding a new school
  const handleAddSchool = async (newSchool) => {
    try {
      const addedSchool = await addSchool(newSchool.label);
      if (!addedSchool || !addedSchool.name || !addedSchool._id) {
        throw new Error("Invalid response from addSchool");
      }
      setSchools((prevSchools) => [
        ...prevSchools,
        { label: addedSchool.name, value: addedSchool._id },
      ]);
    } catch (error) {
      console.error("Failed to add school:", error);
      alert(error.message || "Failed to add new school. Please try again later.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
      {loading && <p className="text-center text-blue-600">Loading...</p>}
      {errorMessage && <p className="text-center text-red-600 mb-4">{errorMessage}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Teacher Name */}
        <InputField
          label="Teacher Name"
          type="text"
          register={register("name", { required: "Teacher's name is required" })}
          error={errors.name}
        />

        {/* Subjects Dropdown */}
        <MultiSelectWithAddOption
          options={subjects}
          placeholder="Select subjects"
          onOptionCreate={handleAddSubject}
          onSelectionChange={(selectedList) => setValue("subjects", selectedList)}
        />

        {/* Schools Dropdown */}
        <SingleSelectWithAddOption
          options={schools}
          placeholder="Select or create a school"
          onOptionCreate={handleAddSchool}
          onSelectionChange={(selectedOption) => setValue("school", selectedOption)}
        />

        {/* Submit Button */}
        <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded-md shadow hover:bg-green-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default TeacherForm;
