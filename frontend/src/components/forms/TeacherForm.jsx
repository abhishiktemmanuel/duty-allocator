import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../form-components/InputField.jsx";
import MultiSelectDropdown from "../form-components/MultiSelectDropdown.jsx";
import SelectDropdown from "../form-components/SelectDropdown.jsx";
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
  const [newSubject, setNewSubject] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [showNewSubjectInput, setShowNewSubjectInput] = useState(false);
  const [showNewSchoolInput, setShowNewSchoolInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch available subjects and schools on component load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const subjectsData = await fetchSubjects();
        const schoolsData = await fetchSchools();

        // Add an "Other" option to both subjects and schools
        setSubjects([...subjectsData, { _id: "other", name: "Other" }]);
        setSchools([...schoolsData, { _id: "other", name: "Other" }]);
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
      subjects: formData.subjects.map((sub) => sub._id),
      school: formData.school,
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
        <MultiSelectDropdown
          label="Subjects"
          options={subjects}
          placeholder="Select Subjects"
          onChange={(selectedList) => {
            setValue("subjects", selectedList);
            setShowNewSubjectInput(selectedList.some((item) => item._id === "other"));
          }}
          error={errors.subjects}
        />
        {showNewSubjectInput && (
          <div className="mt-4 flex items-center space-x-2">
            <InputField
              label=""
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add new subject"
            />
            <button
              type="button"
              onClick={async () => {
                await addSubject(newSubject);
                setShowNewSubjectInput(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
            >
              Add Subject
            </button>
          </div>
        )}

        {/* Schools Dropdown */}
        <SelectDropdown
          label="School"
          options={schools}
          register={register("school", { required: "Please select a school" })}
          onChange={(e) => setShowNewSchoolInput(e.target.value === "other")}
          error={errors.school}
        />
        {showNewSchoolInput && (
          <div className="mt-4 flex items-center space-x-2">
            <InputField
              label=""
              type="text"
              value={newSchool}
              onChange={(e) => setNewSchool(e.target.value)}
              placeholder="Add new school"
            />
            <button
              type="button"
              onClick={async () => {
                await addSchool(newSchool);
                setShowNewSchoolInput(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
            >
              Add School
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded-md shadow hover:bg-green-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default TeacherForm;










// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import Multiselect from "multiselect-react-dropdown";

// const TeacherForm = () => {
//   const {
//     register,
//     handleSubmit,
//     reset,
//     setValue,
//     formState: { errors },
//   } = useForm();
//   const [subjects, setSubjects] = useState([]);
//   const [schools, setSchools] = useState([]);
//   const [newSubject, setNewSubject] = useState("");
//   const [newSchool, setNewSchool] = useState("");
//   const [showNewSubjectInput, setShowNewSubjectInput] = useState(false);
//   const [showNewSchoolInput, setShowNewSchoolInput] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   // Fetch available subjects and schools on component load
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const [subjectsResponse, schoolsResponse] = await Promise.all([
//           axios.get("/api/v1/subjects/getsubjects"),
//           axios.get("/api/v1/schools/getschools"),
//         ]);

//         // Add an "Other" option to both subjects and schools
//         setSubjects(
//           Array.isArray(subjectsResponse.data.message)
//             ? [...subjectsResponse.data.message, { _id: "other", name: "Other" }]
//             : []
//         );
//         setSchools(
//           Array.isArray(schoolsResponse.data.message)
//             ? [...schoolsResponse.data.message, { _id: "other", name: "Other" }]
//             : []
//         );
//       } catch (error) {
//         console.error("Failed to load data:", error);
//         setErrorMessage(
//           "Failed to fetch subjects or schools. Please try again later."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);

//   // Add new subject
//   const handleAddSubject = async () => {
//     if (!newSubject.trim()) return alert("Subject name cannot be empty.");
//     try {
//       const response = await axios.post("/api/v1/subjects/newsubject", {
//         name: newSubject,
//       });
//       setSubjects((prev) => [...prev, response.data.message]);
//       setNewSubject("");
//       setShowNewSubjectInput(false); // Hide input after adding
//     } catch (error) {
//       console.error("Failed to create subject:", error);
//       alert("Failed to add subject. Please try again later.");
//     }
//   };

//   // Add new school
//   const handleAddSchool = async () => {
//     if (!newSchool.trim()) return alert("School name cannot be empty.");
//     try {
//       const response = await axios.post("/api/v1/schools/newschool", {
//         name: newSchool,
//       });
//       setSchools((prev) => [...prev, response.data.message]);
//       setNewSchool("");
//       setShowNewSchoolInput(false); // Hide input after adding
//     } catch (error) {
//       console.error("Failed to create school:", error);
//       alert("Failed to add school. Please try again later.");
//     }
//   };

//   // Submit form data
//   const onSubmit = async (formData) => {
//     // Transform formData to match the model’s fields
//     const payload = {
//       name: formData.name,
//       subjects: formData.subjects.map((sub) => sub._id), // Extract only IDs of selected subjects
//       school: formData.school,
//     };

//     try {
//       console.log("Form Data Submitted:", payload);
//       await axios.post("/api/v1/teachers/newteacher", payload);
//       reset();
//       alert("Teacher added successfully.");
//     } catch (error) {
//       console.error("Failed to add teacher:", error);
//       alert("Failed to submit the form. Please try again later.");
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
//       {loading && <p className="text-center text-blue-600">Loading...</p>}
//       {errorMessage && (
//         <p className="text-center text-red-600 mb-4">{errorMessage}</p>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Teacher Name */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Teacher Name
//           </label>
//           <input
//             type="text"
//             {...register("name", { required: "Teacher's name is required" })}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//           />
//           {errors.name && (
//             <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
//           )}
//         </div>

//         {/* Multi-Select Dropdown for Subjects */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Subjects
//           </label>
//           <Multiselect
//             options={subjects}
//             displayValue="name"
//             onSelect={(selectedList) => {
//               setValue("subjects", selectedList); 
//               if (selectedList.some((item) => item._id === "other")) {
//                 setShowNewSubjectInput(true); 
//               } else {
//                 setShowNewSubjectInput(false);
//               }
//             }}
//             onRemove={(selectedList) => {
//               setValue("subjects", selectedList); 
//               if (!selectedList.some((item) => item._id === "other")) {
//                 setShowNewSubjectInput(false); 
//               }
//             }}
//             placeholder="Select Subjects"
//             className="mt-1"
//           />
//           {errors.subjects && (
//             <p className="mt-2 text-sm text-red-600">{errors.subjects.message}</p>
//           )}

//           {/* Add New Subject Input */}
//           {showNewSubjectInput && (
//             <div className="mt-4 flex items-center space-x-2">
//               <input
//                 type="text"
//                 placeholder="Add new subject"
//                 value={newSubject}
//                 onChange={(e) => setNewSubject(e.target.value)}
//                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//               />
//               <button
//                 type="button"
//                 onClick={handleAddSubject}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
//               >
//                 Add Subject
//               </button>
//             </div>
//           )}
//         </div>

//         {/* School Dropdown */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             School
//           </label>
//           <select
//             {...register("school", { required: "Please select a school" })}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (value === "other") {
//                 setShowNewSchoolInput(true); 
//               } else {
//                 setShowNewSchoolInput(false); 
//               }
//             }}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//           >
//             <option value="">-- Select a School --</option>
//             {schools.map((sch) => (
//               <option key={sch._id} value={sch._id}>
//                 {sch.name}
//               </option>
//             ))}
//           </select>
//           {errors.school && (
//             <p className="mt-2 text-sm text-red-600">{errors.school.message}</p>
//           )}

//           {/* Add New School Input */}
//           {showNewSchoolInput && (
//             <div className="mt-4 flex items-center space-x-2">
//               <input
//                 type="text"
//                 placeholder="Add new school"
//                 value={newSchool}
//                 onChange={(e) => setNewSchool(e.target.value)}
//                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//               />
//               <button
//                 type="button"
//                 onClick={handleAddSchool}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
//               >
//                 Add School
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Submit Button */}
//         <div>
//           <button
//             type="submit"
//             className="w-full py-2 px-4 bg-green-600 text-white rounded-md shadow hover:bg-green-700"
//           >
//             Submit
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default TeacherForm;
