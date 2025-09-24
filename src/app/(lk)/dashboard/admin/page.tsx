import LessonTable from "@/app/components/lesson-table/LessonTable";
import { deleteLesson, getAllLessons } from "@/app/lib/dal/lesson.dal";
import React from "react";
import LessonModal from "./lesson-modal";
import { Lesson } from "@/@types/course";
import { revalidatePath } from "next/cache";

type Props = {};

export default async function AdminPage({}: Props) {
  const lessons = await getAllLessons();

  const handleDelete = async (id: Lesson["id"]) => {
    "use server";
    const res = await deleteLesson(id);
    if (res.success) {
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
