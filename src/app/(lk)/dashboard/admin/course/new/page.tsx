import CourseForm from "@/app/components/forms/course-form";
import { getAllModules } from "@/app/lib/dal/module.dal";
import { getAllSkills } from "@/app/lib/dal/skill.dal";
import { createCourse } from "@/app/actions/courses";

export default async function NewCoursePage() {
  const [modules, skills] = await Promise.all([
    getAllModules(),
    getAllSkills(),
  ]);

  return (
    <CourseForm
      modules={modules}
      skills={skills}
      title="Создание нового курса"
      submitButtonText="Создать курс"
      onSubmit={createCourse}
    />
  );
}
