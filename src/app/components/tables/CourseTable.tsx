"use client";

import { Course } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { FC, useReducer } from "react";
import s from "./style.module.css";
import DeleteDialog from "../dialogs/delete-dialog";
import { useRouter } from "next/navigation";

type Props = {
  data: Course[];
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

const CourseTable: FC<Props> = ({ data, handleDelete }) => {
  const router = useRouter();

  const [modalDeleteState, dispatch] = useReducer(reducer, {
    open: false,
    courseId: undefined,
  });

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
                      onClick={() =>
                        router.push("admin/course/edit/" + courseItem.id)
                      }
                    >
                      Изменить
                    </Button>
                    <Button
                      color="error"
                      onClick={() =>
                        dispatch({ type: "open", value: courseItem.id })
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

      <DeleteDialog
        open={modalDeleteState.open}
        onDelete={onDeleteHandle}
        onBack={onCloseHandle}
      />
    </>
  );
};

export default CourseTable;
