import axios from "axios";

// Create an Axios instance for API calls
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api/v1",
});

// Add a request interceptor to include the token and organization ID in headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const organizationId = localStorage.getItem("organizationId");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (organizationId) {
      config.headers["x-org-id"] = organizationId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication APIs
export const registerUser = async (userData) => {
  try {
    const response = await API.post("/auth/register/admin", userData);
    return response.data.message;
  } catch (error) {
    console.error(
      "Error registering new user:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to register new user"
    );
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await API.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error(
      "Error logging in:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to login");
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};

// Subject APIs
export const fetchSubjects = async () => {
  try {
    const response = await API.get("/subjects/getsubjects");
    return response.data.message;
  } catch (error) {
    console.error(
      "Error fetching subjects:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch subjects"
    );
  }
};

export const addSubject = async (name) => {
  try {
    const response = await API.post("/subjects/newsubject", { name });
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format from server");
    }
    return response.data.data;
  } catch (error) {
    console.error(
      "Error adding subject:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to add subject");
  }
};

// Schedule APIs
export const submitSchedule = async (payload) => {
  try {
    const response = await API.post("/schedules/addexam", payload);
    return response.data;
  } catch (error) {
    console.error(
      "Error submitting schedule:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to submit schedule"
    );
  }
};

export const fetchExamSchedules = async () => {
  try {
    const response = await API.get("/schedules/getexams");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching schedules:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch schedules"
    );
  }
};

export const deleteSchedule = async (scheduleId) => {
  try {
    const response = await API.delete(`/schedules/deleteexam/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting schedule:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to delete schedule"
    );
  }
};

export const updateSchedule = async (scheduleId, payload) => {
  try {
    const response = await API.put(
      `/schedules/updateexam/${scheduleId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating schedule:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to update schedule"
    );
  }
};

// School APIs
export const fetchSchools = async () => {
  try {
    const response = await API.get("/schools/getschools");
    return response.data.message;
  } catch (error) {
    console.error(
      "Error fetching schools:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to fetch schools");
  }
};

export const addSchool = async (name) => {
  try {
    const response = await API.post("/schools/newschool", { name });
    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format from server");
    }
    return response.data.data;
  } catch (error) {
    console.error(
      "Error adding school:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to add school");
  }
};

// Teacher APIs
export const submitTeacher = async (payload) => {
  try {
    await API.post("/teachers/newteacher", payload);
  } catch (error) {
    console.error(
      "Error submitting teacher:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to submit teacher"
    );
  }
};

export const fetchTeachers = async () => {
  try {
    const response = await API.get("/teachers/getteachers");
    return response.data.message;
  } catch (error) {
    console.error(
      "Error fetching teachers:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch teachers"
    );
  }
};

export const setDuty = async () => {
  try {
    const response = await API.get("/duty/setduty");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to set duty");
  }
};

// Teacher APIs for delete and update
export const deleteTeacher = async (teacherId) => {
  try {
    const response = await API.delete(`/teachers/teacher/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting teacher:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to delete teacher"
    );
  }
};

export const updateTeacher = async (teacherId, payload) => {
  try {
    const response = await API.put(`/teachers/teacher/${teacherId}`, payload);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating teacher:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to update teacher"
    );
  }
};
