import LessonTable from "@/app/components/tables/LessonTable";
import { getAllLessons } from "@/app/lib/dal/lesson.dal";
import React from "react";
import LessonModal from "./lesson-modal";
import { revalidatePath } from "next/cache";
import { getUser } from "@/app/lib/dal";
import { notFound } from "next/navigation";
import CourseTable from "@/app/components/tables/CourseTable";
import Button from "@/app/ui/Button/Button";
import { getAllCourses } from "@/app/lib/dal/course.dal";
import Link from "next/link";
import { getAllModules } from "@/app/lib/dal/module.dal";
import ModuleTable from "@/app/components/tables/ModuleTable";
import { deleteCourse } from "@/app/actions/courses";
import { deleteModule } from "@/app/actions/modules";
import { deleteLesson } from "@/app/actions/lessons";
import { canManage, isAdmin } from "@/app/utils/permissions";
import s from "./style.module.css";

export const metadata = { title: "Панель управления" };

export default async function AdminPage() {
  const user = await getUser();
  if (!canManage(user)) {
    notFound();
  }

  const [lessons, modules, courses] = await Promise.all([
    getAllLessons(),
    getAllModules(),
    getAllCourses(),
  ]);
  const handleChange = async () => {
    "use server";
    revalidatePath("/dashboard/admin");
  };

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>Панель управления</h1>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>Курсы</h2>
          <Link href={"admin/course/new"}>
            <Button size="sm">Добавить курс</Button>
          </Link>
        </div>
        <CourseTable
          data={courses}
          handleDelete={deleteCourse}
          canDelete={isAdmin(user)}
        />
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>Темы</h2>
          <Link href={"admin/module/new"}>
            <Button size="sm">Добавить тему</Button>
          </Link>
        </div>
        <ModuleTable
          data={modules}
          handleDelete={deleteModule}
          canDelete={isAdmin(user)}
        />
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>Уроки</h2>
          <LessonModal />
        </div>
        <LessonTable
          data={lessons}
          handleChange={handleChange}
          handleDelete={deleteLesson}
          canDelete={isAdmin(user)}
        />
      </section>
    </div>
  );
}
