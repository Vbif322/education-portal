import LessonItem from "@/app/components/lesson-item/LessonItem";
import LessonTable from "@/app/components/lesson-table/LessonTable";
import { getAllLessons } from "@/app/lib/dal";
import React from "react";

type Props = {};

export default async function AdminPage({}: Props) {
  const lessons = await getAllLessons();
  console.log(lessons);
  return (
    <div>
      <p>Уроки</p>
      <div>
        <LessonTable data={lessons} />
      </div>
    </div>
  );
}
