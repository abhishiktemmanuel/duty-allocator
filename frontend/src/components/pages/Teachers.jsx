import ScheduleForm from '../forms/ScheduleForm'
import TeacherForm from '../forms/TeacherForm'
import TeacherTable from '../tables/TeachersTable'

function Teachers() {
  return (
    <>
        <TeacherForm />
        <ScheduleForm />
        <TeacherTable />
    </>
  )
}

export default Teachers