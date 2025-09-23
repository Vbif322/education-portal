import LessonTable from "@/app/components/lesson-table/LessonTable";
import { getAllLessons } from "@/app/lib/dal";
import React from "react";
import LessonModal from "./lesson-modal";

type Props = {};

export default async function AdminPage({}: Props) {
  const lessons = await getAllLessons();
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
          <LessonTable data={lessons} />
        </div>
      </div>
    </>
  );
}
