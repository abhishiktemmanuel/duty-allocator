import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  fetchSubjects,
  fetchSchools,
  createSubject,
  createSchool,
  createTeacher,
} from "../../services/backendApi";

const TeacherForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [subjects, setSubjects] = useState([]);
  const [schools, setSchools] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [newSchool, setNewSchool] = useState("");

  // Fetch available subjects and schools on component load
  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedSubjects = await fetchSubjects();
        const fetchedSchools = await fetchSchools();
        setSubjects(fetchedSubjects);
        setSchools(fetchedSchools);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    loadData();
  }, []);

  // Add new subject to backend and local state
  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      const createdSubject = await createSubject(newSubject);
      setSubjects((prev) => [...prev, createdSubject]);
      setNewSubject("");
    } catch (error) {
      console.error("Failed to create subject", error);
    }
  };

  // Add new school to backend and local state
  const handleAddSchool = async () => {
    if (!newSchool.trim()) return;
    try {
      const createdSchool = await createSchool(newSchool);
      setSchools((prev) => [...prev, createdSchool]);
      setNewSchool("");
    } catch (error) {
      console.error("Failed to create school", error);
    }
  };

  // Submit form data
  const onSubmit = async (data) => {
    try {
      await createTeacher(data);
      reset();
      alert("Teacher added successfully.");
    } catch (error) {
      console.error("Failed to add teacher", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Teacher Name</label>
        <input
          type="text"
          {...register("teacherName", { required: "Teacher's name is required" })}
        />
        {errors.teacherName && <p>{errors.teacherName.message}</p>}
      </div>

      <div>
        <label>Subject</label>
        <select {...register("subject", { required: "Please select a subject" })}>
          <option value="">-- Select a Subject --</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
        {errors.subject && <p>{errors.subject.message}</p>}

        <div style={{ marginTop: "0.5rem" }}>
          <input
            type="text"
            placeholder="Add new subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button type="button" onClick={handleAddSubject}>
            Add Subject
          </button>
        </div>
      </div>

      <div>
        <label>School</label>
        <select {...register("school", { required: "Please select a school" })}>
          <option value="">-- Select a School --</option>
          {schools.map((sch) => (
            <option key={sch.id} value={sch.id}>
              {sch.name}
            </option>
          ))}
        </select>
        {errors.school && <p>{errors.school.message}</p>}

        <div style={{ marginTop: "0.5rem" }}>
          <input
            type="text"
            placeholder="Add new school"
            value={newSchool}
            onChange={(e) => setNewSchool(e.target.value)}
          />
          <button type="button" onClick={handleAddSchool}>
            Add School
          </button>
        </div>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default TeacherForm;
