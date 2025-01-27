import { useEffect, useState } from "react";
import { fetchTeachers, deleteTeacher, updateTeacher } from "../../services/backendApi";

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTeacher, setEditingTeacher] = useState(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await fetchTeachers();
      setTeachers(response || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading teachers:', err);
      setError('Failed to load teachers');
      setTeachers([]);
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateTeacher(editingTeacher._id, editingTeacher);
      setEditingTeacher(null);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingTeacher(prev => ({
      ...prev,
      [name]: value
    }));
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
    <div>
      {editingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Teacher</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingTeacher.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
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
                  <td className="py-4 px-6">
                    {teacher.name}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {teacher.school?.name}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        onClick={() => handleEdit(teacher)}
                      >
                        Edit
                      </button>
                      <button
                        className="font-medium text-red-600 dark:text-red-500 hover:underline"
                        onClick={() => handleDelete(teacher._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No teachers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherTable;
