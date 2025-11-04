import LessonTable from "@/app/components/tables/LessonTable";
import { getAllLessons } from "@/app/lib/dal/lesson.dal";
import React from "react";
import LessonModal from "./lesson-modal";
import { Lesson } from "@/@types/course";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getUser } from "@/app/lib/dal";
import { notFound } from "next/navigation";
import CourseTable from "@/app/components/tables/CourseTable";
import Button from "@/app/ui/Button/Button";
import { getAllCourses } from "@/app/lib/dal/course.dal";
import Link from "next/link";
import { getAllModules } from "@/app/lib/dal/module.dal";
import ModuleTable from "@/app/components/tables/ModuleTable";

export default async function AdminPage() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    notFound();
  }

  const lessons = await getAllLessons();
  const modules = await getAllModules();
  const courses = await getAllCourses();

  const handleDelete = async (id: Lesson["id"]) => {
    "use server";
    const res = await fetch(process.env.BASE_URL + "/api/lessons/lesson", {
      method: "DELETE",
      headers: {
        Cookie: (await cookies()).toString(),
      },
      body: JSON.stringify({ lessonId: id }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(data);
    } else {
      revalidatePath("/dashboard/admin");
    }
  };
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
        <Link href={"admin/newcourse"}>
          <Button>Добавить курс</Button>
        </Link>
      </div>
      <div>
        <CourseTable
          data={courses}
          handleAttach={handleAttach}
          handleChange={handleChange}
          handleDelete={handleDelete}
        />
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
        <Link href={"admin/newcourse"}>
          <Button>Добавить тему</Button>
        </Link>
      </div>
      <div>
        <ModuleTable
          data={modules}
          handleAttach={handleAttach}
          handleChange={handleChange}
          handleDelete={handleDelete}
        />
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
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
}
