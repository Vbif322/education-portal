"use client";

import { Course } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { FC, useReducer, useState } from "react";
import s from "./style.module.css";
import LessonChangeModal from "@/app/(lk)/dashboard/admin/lesson-change-modal";
import DeleteDialog from "../dialogs/delete-dialog";

type Props = {
  data: Course[];
  handleChange: (arg01: Course["id"]) => void;
  handleDelete: (arg01: Course["id"]) => void;
};

function reducer(
  state: {
    open: boolean;
    courseId?: number;
  },
  action: { type: "open" | "close"; value?: number }
) {
  switch (action.type) {
    case "open":
      return {
        open: true,
        courseId: action.value,
      };
    case "close":
      return {
        open: false,
        courseId: undefined,
      };

    default:
      return state;
  }
}

const CourseTable: FC<Props> = ({ data, handleChange, handleDelete }) => {
  const [modalState, setModalState] = useState<{
    open: boolean;
    course: Course | undefined;
  }>({ open: false, course: undefined });

  const [modalDeleteState, dispatch] = useReducer(reducer, {
    open: false,
    courseId: undefined,
  });

  const onChangeHandle = (course: Course) => {
    handleChange(course.id);
    setModalState({ open: true, course: course });
  };

  const onCloseHandle = () => {
    dispatch({ type: "close" });
  };

  const onDeleteHandle = () => {
    if (!modalDeleteState.courseId) return;
    handleDelete(modalDeleteState.courseId);
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
              <th style={{ textAlign: "center" }}>Управление</th>
            </tr>
          </thead>
          <tbody>
            {data.map((courseItem) => {
              return (
                <tr key={courseItem.id}>
                  <td>{courseItem.name}</td>
                  <td>
                    {courseItem.privacy === "private"
                      ? "Доступ закрыт"
                      : "Доступ открыт"}
                  </td>
                  <td style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="text"
                      onClick={() => onChangeHandle(courseItem)}
                    >
                      Изменить
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* <LessonChangeModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, lesson: undefined })}
        lesson={modalState.lesson}
      />
      <DeleteDialog
        open={modalDeleteState.open}
        onDelete={onDeleteHandle}
        onBack={onCloseHandle}
      /> */}
    </>
  );
};

export default CourseTable;
