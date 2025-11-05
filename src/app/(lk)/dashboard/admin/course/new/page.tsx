import CourseForm from "@/app/components/forms/course-form";
import { getAllModules } from "@/app/lib/dal/module.dal";
import { createCourse } from "@/app/actions/courses";

export default async function NewCoursePage() {
  const modules = await getAllModules();

  return (
    <CourseForm
      modules={modules}
      title="Создание нового курса"
      submitButtonText="Создать курс"
      onSubmit={createCourse}
    />
  );
}
