"use client";

import { Module } from "@/@types/course";
import Button from "@/app/ui/Button/Button";
import { FC, useReducer } from "react";
import s from "./style.module.css";
import { useRouter } from "next/navigation";
import DeleteDialog from "../dialogs/delete-dialog";

type Props = {
  data: Module[];
  handleDelete: (arg01: Module["id"]) => void;
  canDelete?: boolean;
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

const ModuleTable: FC<Props> = ({ data, handleDelete, canDelete = true }) => {
  const router = useRouter();

  const [modalDeleteState, dispatch] = useReducer(reducer, {
    open: false,
    courseId: undefined,
  });

  const onChangeHandle = (module: Module) => {
    router.push(`/dashboard/admin/module/edit/${module.id}`);
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
              {/* <th>Доступность</th> */}
              <th style={{ textAlign: "center" }}>Управление</th>
            </tr>
          </thead>
          <tbody>
            {data.map((moduleItem) => {
              return (
                <tr key={moduleItem.id}>
                  <td>{moduleItem.name}</td>
                  {/* <td>
                    {courseItem.privacy === "private"
                      ? "Доступ закрыт"
                      : "Доступ открыт"}
                  </td> */}
                  <td style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="text"
                      onClick={() => onChangeHandle(moduleItem)}
                    >
                      Изменить
                    </Button>
                    {canDelete && (
                      <Button
                        color="error"
                        onClick={() =>
                          dispatch({ type: "open", value: moduleItem.id })
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
      <DeleteDialog
        open={modalDeleteState.open}
        onDelete={onDeleteHandle}
        onBack={onCloseHandle}
      />
    </>
  );
};

export default ModuleTable;
