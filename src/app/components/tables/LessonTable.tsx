"use client";

import { Lesson } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { FC, useReducer, useState } from "react";
import s from "./style.module.css";
import LessonChangeModal from "@/app/(lk)/dashboard/admin/lesson-change-modal";
import DeleteDialog from "../dialogs/delete-dialog";
import { formatTime } from "@/app/utils/helpers";

type Props = {
  data: Lesson[];
  handleChange: (arg01: Lesson["id"]) => void;
  handleAttach: (arg01: Lesson["id"]) => void;
  handleDelete: (arg01: Lesson["id"]) => void;
  canDelete?: boolean;
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
  canDelete = true,
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
              return (
                <tr key={lessonItem.id}>
                  <td>{lessonItem.name}</td>
                  <td>
                    {lessonItem.status === "private"
                      ? "Доступ закрыт"
                      : "Доступ открыт"}
                  </td>
                  <td>{formatTime(lessonItem.duration)}</td>
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
                    {canDelete && (
                      <Button
                        color="error"
                        onClick={() =>
                          dispatch({ type: "open", value: lessonItem.id })
                        }
                      >
                        Удалить
                      </Button>
                    )}
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
