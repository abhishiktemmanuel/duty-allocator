import {Fragment, useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  fetchTeachers,
  deleteTeacher,
  updateTeacher,
  fetchSubjects,
  fetchSchools,
  addBulkTeachers,
  deleteMultipleTeachers,
  generateMergeUrl,
  disconnectTeacherAccount,
} from "../../services/backendApi";
import { exportToCSV } from "../../services/csvExport";
import MultiSelectWithAddOption from "../form-components/MultiSelectWithAddOption.jsx";
import SingleSelectWithAddOption from "../form-components/SingleSelectWithAddOption.jsx";
import Modal from "../common/Modal"; // Ensure you have a Modal component

const TeacherTable = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [mergeUrls, setMergeUrls] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

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
      console.error("Error loading teachers:", err);
      setTeachers([]);
      setLoading(false);
    }
  };
  const handleGenerateMergeUrl = async (teacherId) => {
    try {
      const { mergeUrl } = await generateMergeUrl(teacherId);
      setMergeUrls(prev => ({ ...prev, [teacherId]: mergeUrl }));
    } catch (error) {
      console.error("Error generating merge URL:", error);
      alert("Failed to generate merge URL");
    }
  };
  const handleDisconnect = async (teacherId) => {
    if (window.confirm("Are you sure you want to disconnect this account?")) {
      try {
        await disconnectTeacherAccount(teacherId);
        await loadTeachers(); // Refresh the list
      } catch (error) {
        console.error("Disconnection failed:", error);
        setError("Failed to disconnect account");
      }
    }
  };
  const toggleRowExpansion = (teacherId) => {
    setExpandedRow(prev => prev === teacherId ? null : teacherId);
  };

  const loadSubjects = async () => {
    try {
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData.map((sub) => ({ label: sub.name, value: sub._id })));
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  const loadSchools = async () => {
    try {
      const schoolsData = await fetchSchools();
      setSchools(schoolsData.map((school) => ({ label: school.name, value: school._id })));
    } catch (error) {
      console.error("Error loading schools:", error);
    }
  };

  const handleExportTeachers = () => {
    const headers = [
      { label: "Teacher Name", key: "name" },
      { label: "Subjects", key: "subjects" },
      { label: "School", key: "school" },
      { label: "Merge URL", key: "mergeUrl" },
      { label: "Account Status", key: "status" },
    ];

    const exportData = teachers.map((teacher) => ({
      name: teacher.name,
      subjects: teacher.subjects.map((subject) => subject.name).join(", "),
      school: teacher.school?.name || "N/A",
      mergeUrl: mergeUrls[teacher._id] || "N/A",
      status: teacher.accountStatus === "connected" ? "Connected" : "Not Connected"
    }));

    exportToCSV(exportData, {
      headers,
      filename: `teachers-list-${new Date().toISOString().split("T")[0]}`,
    });
  };

  const handleEdit = (teacherId) => {
    setEditingTeacherId(teacherId);
  };

  const handleUpdate = async (teacherId) => {
    try {
      const teacherToUpdate = teachers.find((t) => t._id === teacherId);
      await updateTeacher(teacherId, teacherToUpdate);
      setEditingTeacherId(null);
      await loadTeachers();
    } catch (err) {
      console.error("Error updating teacher:", err);
      setError("Failed to update teacher");
    }
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await deleteTeacher(teacherId);
        await loadTeachers();
      } catch (err) {
        console.error("Error deleting teacher:", err);
        setError("Failed to delete teacher");
      }
    }
  };

  const handleInputChange = (teacherId, field, value) => {
    setTeachers((prevTeachers) =>
      prevTeachers.map((teacher) =>
        teacher._id === teacherId ? { ...teacher, [field]: value } : teacher
      )
    );
  };

  const handleBulkUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file");
      return;
    }

    try {
      const response = await addBulkTeachers(csvFile);
      setUploadResults(response);
      await loadTeachers(); // Refresh the list
      setTimeout(() => setUploadResults(null), 5000); // Hide results after 5s
    } catch (error) {
      console.error("Bulk upload failed:", error);
      setUploadResults({ errors: [error.message] });
    }
  };

  const handleMultipleDelete = async () => {
    if (!selectedTeachers.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedTeachers.length} teachers?`))
      return;

    try {
      await deleteMultipleTeachers(selectedTeachers);
      await loadTeachers(); // Refresh the list
      setSelectedTeachers([]);
    } catch (error) {
      console.error("Multiple delete failed:", error);
      setError(error.message);
    }
  };

  const toggleAllTeachers = (e) => {
    if (e.target.checked) {
      setSelectedTeachers(teachers.map((t) => t._id));
    } else {
      setSelectedTeachers([]);
    }
  };

  const toggleTeacherSelection = (teacherId) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const renderImportModal = () => (
    <Modal
      title="Bulk Import Teachers"
      onClose={() => setShowImportModal(false)}
      actions={[
        { label: "Cancel", onClick: () => setShowImportModal(false) },
        { label: "Upload", onClick: handleBulkUpload },
      ]}
    >
      <div className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setCsvFile(e.target.files[0])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploadResults && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Upload Results:</h4>
            <p>Successfully added: {uploadResults.successCount}</p>
            {uploadResults.errors?.length > 0 && (
              <div className="mt-2 text-red-600">
                <p>Errors:</p>
                <ul className="list-disc pl-4">
                  {uploadResults.errors.map((error, index) => (
                    <li key={index}>
                      Row {error.row}: {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="text-sm text-gray-500">
          <p>CSV format requirements:</p>
          <ul className="list-disc pl-4 mt-1">
            <li>Columns: name, subjects (comma-separated), school, duties (optional)</li>
            <li>Schools and subjects must already exist in the system</li>
            <li>First row should be headers</li>
          </ul>
        </div>
      </div>
    </Modal>
  );

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
        <style>

        </style>
  
        <div className="flex flex-wrap justify-end pb-2 gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 w-full md:w-auto"
          >
            Import CSV
          </button>
          <button
            onClick={handleExportTeachers}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 w-full md:w-auto"
          >
            Export CSV
          </button>
          {selectedTeachers.length > 0 && (
            <button
              onClick={handleMultipleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 w-full md:w-auto"
            >
              Delete Selected ({selectedTeachers.length})
            </button>
          )}
        </div>
  
        <div className="overflow-x-auto shadow-md rounded-lg responsive-table">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="hidden md:table-header-group text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="py-3 px-6">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.length === teachers.length}
                    onChange={toggleAllTeachers}
                    className="dark-checkbox"
                  />
                </th>
                <th scope="col" className="py-3 px-6">Teacher Name</th>
                <th scope="col" className="py-3 px-6">Subjects</th>
                <th scope="col" className="py-3 px-6">School Name</th>
                <th scope="col" className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(teachers) && teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <Fragment key={teacher._id}>
                  <tr
                    key={teacher._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 lg:hover:bg-gray-50 lg:dark:hover:bg-gray-600"
                    onClick={() => toggleRowExpansion(teacher._id)}
                  >
                    <td className="py-4 px-6" data-label="Select">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleTeacherSelection(teacher._id);
                        }}
                        className="dark-checkbox"
                      />
                    </td>
                    <td className="py-4 px-6 font-medium" data-label="Teacher Name">
                      {editingTeacherId === teacher._id ? (
                        <input
                        type="text"
                        value={teacher.name}
                        onChange={(e) => handleInputChange(teacher._id, "name", e.target.value)}
                        className="w-full p-2 border rounded text-base"
                        onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        teacher.name
                      )}
                    </td>
                    <td className="py-4 px-6" data-label="Subjects">
                      {editingTeacherId === teacher._id ? (
                        <MultiSelectWithAddOption
                          options={subjects}
                          value={teacher.subjects}
                          onSelectionChange={(selectedList) =>
                            handleInputChange(teacher._id, "subjects", selectedList)
                          }
                          className="w-full text-base"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded"
                            >
                              {subject.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6" data-label="School Name">
                      {editingTeacherId === teacher._id ? (
                        <SingleSelectWithAddOption
                          options={schools}
                          value={teacher.school}
                          onSelectionChange={(selectedOption) =>
                            handleInputChange(teacher._id, "school", selectedOption)
                          }
                          className="w-full text-base"
                        />
                      ) : (
                        teacher.school?.name
                      )}
                    </td>
                    <td className="py-4 px-6" data-label="Actions">
                      <div className="flex flex-col md:flex-row gap-2 mobile-stack">
                        {editingTeacherId === teacher._id ? (
                          <>
                            <button
                               onClick={(e) => {
                                e.stopPropagation();
                                handleUpdate(teacher._id);
                              }}
                              className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTeacherId(null);
                              }}
                              className="text-gray-600 dark:text-gray-400 hover:underline text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          
                          <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(teacher._id);
                          }}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                          >
                            Edit
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(teacher._id);
                          }}
                          className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === teacher._id && (
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td colSpan="5" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Account Management</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  teacher.accountStatus === "connected"
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              />
                              <span>
                                Status: {teacher.accountStatus === "connected" ? "Connected" : "Not Connected"}
                              </span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <CopyToClipboard text={mergeUrls[teacher._id] || ""}>
                                <button
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!mergeUrls[teacher._id]) {
                                      handleGenerateMergeUrl(teacher._id);
                                    }
                                  }}
                                >
                                  {mergeUrls[teacher._id] ? "📋 Copy URL" : "🔗 Generate URL"}
                                </button>
                              </CopyToClipboard>
                              {teacher.accountStatus === "connected" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDisconnect(teacher._id);
                                  }}
                                  className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
                                >
                                  🚫 Disconnect
                                </button>
                              )}
                            </div>
                            {mergeUrls[teacher._id] && (
                              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 break-all">
                                Merge URL: {mergeUrls[teacher._id]}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Connection History</h4>
                            {teacher.connectionHistory?.length > 0 ? (
                              <ul className="list-disc pl-4 text-sm">
                                {teacher.connectionHistory.map((entry, idx) => (
                                  <li key={idx} className="dark:text-gray-300">
                                    {new Date(entry.date).toLocaleDateString()} - {entry.status}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 dark:text-gray-400 text-sm">
                                No connection history available
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
  
        {showImportModal && renderImportModal()}
      </div>
    );
};
export default TeacherTable;