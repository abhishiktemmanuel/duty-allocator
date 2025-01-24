import axios from "axios";

export const fetchSubjects = async () => {
  const response = await axios.get("/api/v1/subjects/getsubjects");
  return response.data.message;
};

export const fetchSchools = async () => {
  const response = await axios.get("/api/v1/schools/getschools");
  return response.data.message;
};

export const addSubject = async (name) => {
  await axios.post("/api/v1/subjects/newsubject", { name });
};

export const addSchool = async (name) => {
  await axios.post("/api/v1/schools/newschool", { name });
};

export const submitTeacher = async (payload) => {
  await axios.post("/api/v1/teachers/newteacher", payload);
};

export const fetchTeachers = async () => {
  const response = await axios.get("/api/v1/teachers/getteachers");
  return response.data.message;
};
