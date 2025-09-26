"use client";

import { Lesson } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { FC, useState } from "react";
import s from "./style.module.css";
import LessonChangeModal from "@/app/(lk)/dashboard/admin/lesson-change-modal";

type Props = {
  data: Lesson[];
  handleChange: (arg01: Lesson["id"]) => void;
  handleAttach: (arg01: Lesson["id"]) => void;
  handleDelete: (arg01: Lesson["id"]) => void;
};

const LessonTable: FC<Props> = ({
  data,
  handleChange,
  handleAttach,
  handleDelete,
}) => {
  const [modalState, setModalState] = useState<{
    open: boolean;
    lesson: Lesson | undefined;
  }>({ open: false, lesson: undefined });

  const onChangeHandle = (lesson: Lesson) => {
    handleChange(lesson.id);
    setModalState({ open: true, lesson: lesson });
  };

  return (
    <>
      <div className={s.table__container}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Доступность</th>
              <th style={{ textAlign: "center" }}>Управление</th>
            </tr>
          </thead>
          <tbody>
            {data.map((lessonItem) => {
              return (
                <tr key={lessonItem.id}>
                  <td>{lessonItem.name}</td>
                  <td>
                    {lessonItem.status === "private"
                      ? "Доступ закрыт"
                      : "Доступ открыт"}
                  </td>
                  <td style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="text"
                      onClick={() => onChangeHandle(lessonItem)}
                    >
                      Изменить
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => handleAttach(lessonItem.id)}
                      disabled
                    >
                      Прикрепить материалы
                    </Button>
                    <Button
                      style={{ backgroundColor: "#d32f2f" }}
                      onClick={() => handleDelete(lessonItem.id)}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <LessonChangeModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, lesson: undefined })}
        lesson={modalState.lesson}
      />
    </>
  );
};

export default LessonTable;
