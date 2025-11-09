import CourseForm from "@/app/components/forms/course-form";
import { getAllModules } from "@/app/lib/dal/module.dal";
import { getAllSkills } from "@/app/lib/dal/skill.dal";
import { getCourseById } from "@/app/lib/dal/course.dal";
import { updateCourse } from "@/app/actions/courses";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  const courseId = parseInt(id, 10);

  if (isNaN(courseId)) {
    notFound();
  }

  const [modules, skills, course] = await Promise.all([
    getAllModules(),
    getAllSkills(),
    getCourseById(courseId),
  ]);

  if (!course) {
    notFound();
  }

  const handleUpdate = async (data: {
    name: string;
    description?: string;
    privacy: "public" | "private";
    modules: { moduleId: number; order: number }[];
    skills: number[];
    showOnLanding: boolean;
  }) => {
    "use server";
    return updateCourse(courseId, data);
  };

  return (
    <CourseForm
      modules={modules}
      skills={skills}
      course={course}
      title="Редактирование курса"
      submitButtonText="Сохранить изменения"
      onSubmit={handleUpdate}
    />
  );
}
