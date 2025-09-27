import LessonTable from "@/app/components/lesson-table/LessonTable";
import { getAllLessons } from "@/app/lib/dal/lesson.dal";
import React from "react";
import LessonModal from "./lesson-modal";
import { Lesson } from "@/@types/course";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getUser } from "@/app/lib/dal";
import { notFound, redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    notFound();
  }

  const lessons = await getAllLessons();

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
    console.log("change");
    revalidatePath("/dashboard/admin");
  };
  return (
    <>
      <div>
        <h4>Уроки</h4>
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
    </>
  );
}
