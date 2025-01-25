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
  try {
    const response = await axios.post("/api/v1/subjects/newsubject", { name });

    // Check if response contains valid data
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format from server");
    }

    return response.data.data; // Return the newly created subject
  } catch (error) {
    console.error(
      "Error adding subject:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to add subject");
  }
};

export const addSchool = async (name) => {
  try {
    const response = await axios.post("/api/v1/schools/newschool", { name });

    // Check if response contains valid data
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format from server");
    }

    return response.data.data; // Return the newly created school
  } catch (error) {
    console.error(
      "Error adding school:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to add school");
  }
};

export const submitTeacher = async (payload) => {
  await axios.post("/api/v1/teachers/newteacher", payload);
};

export const fetchTeachers = async () => {
  const response = await axios.get("/api/v1/teachers/getteachers");
  return response.data.message;
};

export const submitSchedule = async (payload) => {
  await axios.post("/api/v1/schedules/addexam", payload);
};
