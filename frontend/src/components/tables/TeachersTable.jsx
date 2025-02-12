import { useEffect, useState } from "react";
import { fetchTeachers, deleteTeacher, updateTeacher, fetchSubjects, fetchSchools } from "../../services/backendApi";
import { exportToCSV } from '../../services/csvExport';
import MultiSelectWithAddOption from "../form-components/MultiSelectWithAddOption.jsx";
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption.jsx";

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTeacherId, setEditingTeacherId] = useState(null);

  useEffect(() => {
    loadTeachers();
    loadSubjects();
    loadSchools();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await fetchTeachers();
      setTeachers(response || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading teachers:', err);
      setError('Add teachers, no data found to display');
      setTeachers([]);
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData.map(sub => ({ label: sub.name, value: sub._id })));
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError('Failed to load subjects');
    }
  };

  const loadSchools = async () => {
    try {
      const schoolsData = await fetchSchools();
      setSchools(schoolsData.map(school => ({ label: school.name, value: school._id })));
    } catch (error) {
      console.error('Error loading schools:', error);
      setError('Failed to load schools');
    }
  };

  const handleExportTeachers = () => {
    const headers = [
      { label: 'Teacher Name', key: 'name' },
      { label: 'Subjects', key: 'subjects' },
      { label: 'School', key: 'school' }
    ];

    const exportData = teachers.map(teacher => ({
      name: teacher.name,
      subjects: teacher.subjects.map(subject => subject.name).join(', '),
      school: teacher.school?.name || 'N/A'
    }));

    exportToCSV(exportData, {
      headers,
      filename: `teachers-list-${new Date().toISOString().split('T')[0]}`
    });
  };

  const handleEdit = (teacherId) => {
    setEditingTeacherId(teacherId);
  };

  const handleUpdate = async (teacherId) => {
    try {
      const teacherToUpdate = teachers.find(t => t._id === teacherId);
      await updateTeacher(teacherId, teacherToUpdate);
      setEditingTeacherId(null);
      await loadTeachers();
    } catch (err) {
      console.error('Error updating teacher:', err);
      setError('Failed to update teacher');
    }
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await deleteTeacher(teacherId);
        await loadTeachers();
      } catch (err) {
        console.error('Error deleting teacher:', err);
        setError('Failed to delete teacher');
      }
    }
  };

  const handleInputChange = (teacherId, field, value) => {
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher =>
        teacher._id === teacherId ? { ...teacher, [field]: value } : teacher
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end pb-2">
        <button
          onClick={handleExportTeachers}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
        >
          Export to CSV
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="py-3 px-6">Teacher Name</th>
              <th scope="col" className="py-3 px-6">Subjects</th>
              <th scope="col" className="py-3 px-6">School Name</th>
              <th scope="col" className="py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(teachers) && teachers.length > 0 ? (
              teachers.map((teacher) => (
                <tr 
                  key={teacher._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="py-4 px-6 font-medium">
                    {editingTeacherId === teacher._id ? (
                      <input
                        type="text"
                        value={teacher.name}
                        onChange={(e) => handleInputChange(teacher._id, 'name', e.target.value)}
                        className="w-full p-2 border rounded text-base"
                      />
                    ) : (
                      teacher.name
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {editingTeacherId === teacher._id ? (
                      <MultiSelectWithAddOption
                        options={subjects}
                        value={teacher.subjects}
                        onSelectionChange={(selectedList) => handleInputChange(teacher._id, 'subjects', selectedList)}
                        className="w-full text-base"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject, index) => (
                          <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded">
                            {subject.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {editingTeacherId === teacher._id ? (
                      <SingleSelectWithAddOption
                        options={schools}
                        value={teacher.school}
                        onSelectionChange={(selectedOption) => handleInputChange(teacher._id, 'school', selectedOption)}
                        className="w-full text-base"
                      />
                    ) : (
                      teacher.school?.name
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      {editingTeacherId === teacher._id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(teacher._id)}
                            className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTeacherId(null)}
                            className="text-gray-600 dark:text-gray-400 hover:underline text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(teacher._id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(teacher._id)}
                        className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">No teachers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherTable;
