import TeacherForm from '../forms/TeacherForm'
import TeacherTable from '../tables/TeachersTable'

function Teachers() {
  return (
    <>
    {/* Title outside the form */}
    <h1 className="text-xl font-semibold text-left pl-2 text-gray-900 mb-2 text-center">
        Teacher Details
      </h1>
        <TeacherForm />
        <TeacherTable />
    </>
  )
}

export default Teachers