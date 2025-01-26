import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../form-components/InputField.jsx";
import MultiSelectWithAddOption from "../form-components/MultiSelectWithAddOption.jsx";
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption.jsx";
import {
  fetchSubjects,
  fetchSchools,
  addSubject,
  addSchool,
  submitTeacher,
} from "../../services/backendApi.js";

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const subjectsData = await fetchSubjects();
        const schoolsData = await fetchSchools();
        setSubjects(subjectsData.map((sub) => ({ label: sub.name, value: sub._id })));
        setSchools(schoolsData.map((school) => ({ label: school.name, value: school._id })));
      } catch (error) {
        console.error("Failed to load data:", error);
        setErrorMessage("Failed to fetch subjects or schools. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const onSubmit = async (formData) => {
    console.log(formData);
    const payload = {
      name: formData.name,
      subjects: formData.subjects.map((sub) => sub.value),
      school: formData.school.value,
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

  const handleAddSubject = async (newSubject) => {
    try {
      const addedSubject = await addSubject(newSubject.label);
      setSubjects((prevSubjects) => [...prevSubjects, { label: addedSubject.name, value: addedSubject._id }]);
    } catch (error) {
      console.error("Failed to add subject:", error);
      alert("Failed to add new subject. Please try again later.");
    }
  };

  const handleAddSchool = async (newSchool) => {
    try {
      const addedSchool = await addSchool(newSchool.label);
      setSchools((prevSchools) => [...prevSchools, { label: addedSchool.name, value: addedSchool._id }]);
    } catch (error) {
      console.error("Failed to add school:", error);
      alert("Failed to add new school. Please try again later.");
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

      

<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
  {/* Teacher Name and School Fields */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Teacher Name */}
    <div>
      <InputField
        id="teacherName"
        type="text"
        register={register("name", { required: "Teacher's name is required" })}
        error={errors.name}
        placeholder="Teacher's name"
        className="bg-white border rounded-[20rem] border-gray-300 text-gray-800 text-left indent-2 border-radius-[20rem]
                  focus:ring-blue-500 focus:border-blue-500 block w-full"
      />
      {errors.name && (
        <p className="mt-1 text-sm text-red-600">
          {errors.name.message}
        </p>
      )}
    </div>

    {/* School Dropdown */}
    <div>
      <SingleSelectWithAddOption
        options={schools}
        placeholder="Select school"
        onOptionCreate={handleAddSchool}
        onSelectionChange={(selectedOption) => setValue("school", selectedOption)}
      />
    </div>
  </div>

  {/* Subjects Dropdown */}
  <div>

  
  <div className="w-lg align">
    <MultiSelectWithAddOption
      options={subjects}
      placeholder="Select subjects"
      onOptionCreate={handleAddSubject}
      onSelectionChange={(selectedList) => setValue("subjects", selectedList)}
    />
  </div>

  {/* Submit Button */}
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

export default TeacherForm;
