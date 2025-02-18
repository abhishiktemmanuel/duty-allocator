import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';
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

const TeacherForm = ({ onTeacherAdded }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState,
    formState: {  errors}
  } = useForm({
    defaultValues: {
      name: '',
      subjects: [],
      school: null
    }
  });

  const [subjects, setSubjects] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingSchool, setIsAddingSchool] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const subjectsData = await fetchSubjects();
        const schoolsData = await fetchSchools();
        setSubjects(subjectsData.map((sub) => ({ label: sub.name, value: sub._id })));
        setSchools(schoolsData.map((school) => ({ label: school.name, value: school._id })));
      } catch (error) {
        console.error(error);
        setErrorMessage("Please add data, no subject or school data found. ");
        setTimeout(() => setErrorMessage(""), 3000);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({
        name: '',
        subjects: [],
        school: null
      });
      setSelectedSubjects([]);
      setSelectedSchool(null);
    }
  }, [formState.isSubmitSuccessful, reset]);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const hasTempSubjects = formData.subjects.some(sub => 
        sub.value.startsWith('temp-')
      );
      
      if (hasTempSubjects) {
        throw new Error("Some subjects are still being created");
      }
  
      // Validate school has real ID
      if (formData.school?.value?.startsWith?.('temp-')) {
        throw new Error("School is still being created");
      }  
      const payload = {
        name: formData.name,
        subjects: formData.subjects.map((sub) => sub.value),
        school: formData.school?.value,
      };
  
      await submitTeacher(payload);
      setSuccessMessage("Teacher added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      if (onTeacherAdded) onTeacherAdded();
      reset();
    } catch (error) {
      console.error("Failed to add teacher:", error);
      setErrorMessage("Failed to submit the form. Please try again later.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };
  

  const handleAddSubject = async (newSubject) => {
    setIsAddingSubject(true);
    try {
      const addedSubject = await addSubject(newSubject.label);
      const newOption = { label: addedSubject.name, value: addedSubject._id };
      setSubjects((prevSubjects) => [...prevSubjects, newOption]);
      const currentSubjects = Array.isArray(getValues("subjects")) ? getValues("subjects") : [];
      setValue("subjects", [...currentSubjects, newOption]);
      return newOption;
    } catch (error) {
      console.error("Failed to add subject:", error);
      setErrorMessage("Failed to add new subject. Please try again later.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsAddingSubject(false);
    }  
  };
  
  const handleAddSchool = async (newSchool) => {
    setIsAddingSchool(true);
    try {
      const addedSchool = await addSchool(newSchool.label);
      const fullOption = { label: addedSchool.name, value: addedSchool._id };
      setSchools((prev) => [...prev, fullOption]);
      setValue("school", fullOption);
      return fullOption;
    } catch (error) {
      console.error("Failed to add school:", error);
      setErrorMessage("Failed to add new school. Please try again later.");
      setTimeout(() => setErrorMessage(""), 3000);
      return null;
    } finally {
      setIsAddingSchool(false);
    }
  };

  return (
    <div className="w-full p-6 sm:p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg sm:rounded-xl">
  {loading && (
    <p className="text-center text-blue-500 font-semibold mb-4">Loading...</p>
  )}

  {successMessage && (
    <div className="mb-4 p-3 sm:p-4 text-green-700 bg-green-100 border border-green-300 rounded-md sm:rounded-lg">
      {successMessage}
    </div>
  )}

  {errorMessage && (
    <div className="mb-4 p-3 sm:p-4 text-red-700 bg-red-100 border border-red-300 rounded-md sm:rounded-lg">
      {errorMessage}
    </div>
  )}

  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 relative">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div className="w-full">
        <InputField
          id="teacherName"
          type="text"
          register={register("name", { required: "Teacher's name is required" })}
          error={errors.name}
          placeholder="Teacher's name"
                 />
        {errors.name && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="w-full">
        <SingleSelectWithAddOption
          options={schools}
          placeholder="Select school"
          onOptionCreate={handleAddSchool}
          value={selectedSchool || null}
          onSelectionChange={(selectedOption) => {
            setValue("school", selectedOption);
            setSelectedSchool(selectedOption);
          }}
        />
      </div>
    </div>

    <div className="space-y-4">
      <div className="w-full">
        <MultiSelectWithAddOption
          options={subjects}
          placeholder="Select subjects"
          onOptionCreate={handleAddSubject}
          value={selectedSubjects || []}
          onSelectionChange={(selectedList) => {
            setValue("subjects", selectedList);
            setSelectedSubjects(selectedList);
          }}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={submitting || isAddingSubject || isAddingSchool}
          className={`w-full sm:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 
                    focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 
                    sm:px-5 py-2 sm:py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 
                    dark:focus:ring-blue-800 ${
                      submitting || isAddingSubject || isAddingSchool 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  </form>
</div>

  );
};

TeacherForm.propTypes = {
  onTeacherAdded: PropTypes.func
};

export default TeacherForm;
