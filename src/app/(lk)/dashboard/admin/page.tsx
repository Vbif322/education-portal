import LessonTable from "@/app/components/tables/LessonTable";
import { getAllLessons } from "@/app/lib/dal/lesson.dal";
import React from "react";
import LessonModal from "./lesson-modal";
import { Course, Lesson, Module } from "@/@types/course";
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

export default async function AdminPage() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    notFound();
  }

  const [lessons, modules, courses] = await Promise.all([
    getAllLessons(),
    getAllModules(),
    getAllCourses(),
  ]);
  const handleAttach = async () => {
    "use server";
    console.log("attach");
  };
  const handleChange = async () => {
    "use server";
    revalidatePath("/dashboard/admin");
  };
  return (
    <div>
      <h4>Курсы</h4>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
          marginBottom: "16px",
        }}
      >
        <Link href={"admin/course/new"}>
          <Button>Добавить курс</Button>
        </Link>
      </div>
      <div>
        <CourseTable data={courses} handleDelete={deleteCourse} />
      </div>
      <h4 style={{ marginTop: "64px" }}>Темы</h4>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
          marginBottom: "16px",
        }}
      >
        <Link href={"admin/module/new"}>
          <Button>Добавить тему</Button>
        </Link>
      </div>
      <div>
        <ModuleTable data={modules} handleDelete={deleteModule} />
      </div>
      <h4 style={{ marginTop: "64px" }}>Уроки</h4>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
          marginBottom: "16px",
        }}
      >
        <LessonModal />
      </div>
      <div>
        <LessonTable
          data={lessons}
          handleAttach={handleAttach}
          handleChange={handleChange}
          handleDelete={deleteLesson}
        />
      </div>
    </div>
  );
}
