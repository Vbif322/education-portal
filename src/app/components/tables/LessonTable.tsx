"use client";

import { Lesson } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { FC, useReducer, useState } from "react";
import s from "./style.module.css";
import LessonChangeModal from "@/app/(lk)/dashboard/admin/lesson-change-modal";
import DeleteDialog from "../dialogs/delete-dialog";

type Props = {
  data: Lesson[];
  handleChange: (arg01: Lesson["id"]) => void;
  handleAttach: (arg01: Lesson["id"]) => void;
  handleDelete: (arg01: Lesson["id"]) => void;
};

function reducer(
  state: {
    open: boolean;
    lessonId?: number;
  },
  action: { type: "open" | "close"; value?: number }
) {
  switch (action.type) {
    case "open":
      return {
        open: true,
        lessonId: action.value,
      };
    case "close":
      return {
        open: false,
        lessonId: undefined,
      };

    default:
      return state;
  }
}

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

  const [modalDeleteState, dispatch] = useReducer(reducer, {
    open: false,
    lessonId: undefined,
  });

  const onChangeHandle = (lesson: Lesson) => {
    handleChange(lesson.id);
    setModalState({ open: true, lesson: lesson });
  };

  const onCloseHandle = () => {
    dispatch({ type: "close" });
  };

  const onDeleteHandle = () => {
    if (!modalDeleteState.lessonId) return;
    handleDelete(modalDeleteState.lessonId);
    dispatch({ type: "close" });
  };

  return (
    <>
      <div className={s.table__container}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Доступность</th>
              <th>Длительность</th>
              <th style={{ textAlign: "center" }}>Управление</th>
            </tr>
          </thead>
          <tbody>
            {data.map((lessonItem) => {
              let min: string | number = Math.floor(lessonItem.duration / 60);
              if (min < 10) {
                min = "0" + min;
              }
              let sec: string | number = lessonItem.duration % 60;
              if (sec < 10) {
                sec = "0" + sec;
              }
              return (
                <tr key={lessonItem.id}>
                  <td>{lessonItem.name}</td>
                  <td>
                    {lessonItem.status === "private"
                      ? "Доступ закрыт"
                      : "Доступ открыт"}
                  </td>
                  <td>{min + ":" + sec}</td>
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
                      color="error"
                      onClick={() =>
                        dispatch({ type: "open", value: lessonItem.id })
                      }
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
      <DeleteDialog
        open={modalDeleteState.open}
        onDelete={onDeleteHandle}
        onBack={onCloseHandle}
      />
    </>
  );
};

export default LessonTable;
