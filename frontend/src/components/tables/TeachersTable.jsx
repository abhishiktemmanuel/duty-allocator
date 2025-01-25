import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import Table from "../table-components/Table";
import Loader from "../Loader";
import { fetchTeachers } from "../../services/backendApi";

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await fetchTeachers();
        setTeachers(data);
        console.log(data);
      } catch (err) {
        setError(`Failed to load teacher data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  const columns = [
        {
          Header: "Teacher Name",
          accessor: "name", // Access `name` directly from the teacher object
        },
        {
          Header: "Subjects",
          Cell: ({ value }) => (
            <ul className="list-disc pl-4">
              {value?.map((subject) => (
                <li key={subject._id}>{subject.name}</li>
              ))}
            </ul>
          ),
          accessor: "subjects"
        },
      {
        Header: "School Name",
        accessor: "school.name", // Access nested school name
      },
    ];

  if (loading) return <Loader />;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-xl font-bold mb-4">Teacher Details</h1>
      <Table columns={columns} data={teachers} />
    </div>
  );
};

export default TeacherTable;
