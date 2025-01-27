import { useEffect, useState } from "react";
import Table from "../table-components/Table";
import Loader from "../global-components/Loader";
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
    <Table columns={columns} data={teachers} />
    
  );
};

export default TeacherTable;
