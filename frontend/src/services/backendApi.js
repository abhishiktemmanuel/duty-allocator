// Example API service file.
// In a production setting, handle errors, authentication, and base URLs properly.

export const fetchSubjects = async () => {
  // Replace with an actual API endpoint
  const response = await fetch("/api/subjects");
  if (!response.ok) {
    throw new Error("Failed to fetch subjects");
  }
  return response.json(); // expected format: [{ id, name }, ...]
};

export const fetchSchools = async () => {
  // Replace with an actual API endpoint
  const response = await fetch("/api/schools");
  if (!response.ok) {
    throw new Error("Failed to fetch schools");
  }
  return response.json(); // expected format: [{ id, name }, ...]
};

export const createSubject = async (subjectName) => {
  // Replace with an actual API endpoint
  const response = await fetch("/api/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: subjectName }),
  });
  if (!response.ok) {
    throw new Error("Failed to create subject");
  }
  return response.json(); // expected format: { id, name }
};

export const createSchool = async (schoolName) => {
  // Replace with an actual API endpoint
  const response = await fetch("/api/schools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: schoolName }),
  });
  if (!response.ok) {
    throw new Error("Failed to create school");
  }
  return response.json(); // expected format: { id, name }
};

export const createTeacher = async (teacherData) => {
  // teacherData => { teacherName: string, subject: subjectId, school: schoolId }
  // Replace with an actual API endpoint
  const response = await fetch("/api/teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teacherData),
  });
  if (!response.ok) {
    throw new Error("Failed to create teacher");
  }
  return response.json();
};
