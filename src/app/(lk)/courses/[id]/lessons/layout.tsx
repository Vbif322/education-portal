import { FC } from "react";
import Header from "@/app/components/header/Header";
import { getUser } from "@/app/lib/dal";
import Aside from "../../../../components/aside/Aside";
import s from "./layout.module.css";
import {
  getCourseById,
  getCourseProgress,
  getCompletedLessonIds,
} from "@/app/lib/dal/course.dal";
import { notFound } from "next/navigation";

const ModuleLayout: FC<
  Readonly<{
    children: React.ReactNode;
    params: Promise<{ id: string }>;
  }>
> = async ({ children, params }) => {
  const user = await getUser();
  const { id } = await params;
  const courseId = Number(id);

  const [course, progress, completedLessonIds] = await Promise.all([
    getCourseById(courseId),
    getCourseProgress(courseId),
    getCompletedLessonIds(courseId),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <>
      <Header variant="private" role={user?.role} />
      <div className={s.container}>
        <Aside
          progress={progress.percentage}
          course={course}
          completedLessonIds={completedLessonIds}
        />
        <main className={s.main}>{children}</main>
      </div>
    </>
  );
};

export default ModuleLayout;
