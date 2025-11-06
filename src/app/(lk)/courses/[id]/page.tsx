import { FC } from "react";
import UI from "./ui";
import { getCourseById, isUserEnrolledInCourse } from "@/app/lib/dal/course.dal";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

const skills = [
  "Бережливое производство",
  "Оптимизация процессов",
  "Кайдзен",
  "Канбан",
  "5S",
  "Картирование потоков",
  "Управление изменениями",
  "Непрерывные улучшения",
  "Стандартизация процессов",
  "Анализ потерь",
  "Производственная эффективность",
  "Решение проблем",
];

const CoursePage: FC<Props> = async ({ params }) => {
  const { id } = await params;
  const courseId = parseInt(id);

  if (isNaN(courseId)) {
    notFound();
  }

  const course = await getCourseById(courseId);
  if (!course) {
    notFound();
  }

  const isEnrolled = await isUserEnrolledInCourse(courseId);

  return (
    <UI
      id={id}
      courseId={courseId}
      courseName={course.name}
      courseDescription={course.description}
      skills={skills}
      isEnrolled={isEnrolled}
    />
  );
};

export default CoursePage;
